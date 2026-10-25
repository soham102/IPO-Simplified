import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ipoSchema } from "@/lib/schema";
import type { Ipo } from "@/lib/types";
import { DataProviderError, type IpoDataProvider } from "./provider";

/**
 * Reads IPO records from the `ipos` table (see supabase/migrations).
 * Each row stores a full `Ipo` document in `payload`; every record is
 * validated before use and invalid rows cause an error, not a fallback.
 */
export class SupabaseProvider implements IpoDataProvider {
  readonly name = "Supabase";
  readonly mode = "live" as const;
  private client: SupabaseClient;

  constructor(url: string, key: string) {
    this.client = createClient(url, key, { auth: { persistSession: false } });
  }

  private parse(row: { slug: string; payload: unknown }): Ipo {
    const result = ipoSchema.safeParse(row.payload);
    if (!result.success) {
      throw new DataProviderError(
        `Record "${row.slug}" failed validation: ${result.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")}`,
        this.name,
      );
    }
    return result.data as Ipo;
  }

  async listIpos(): Promise<Ipo[]> {
    const { data, error } = await this.client.from("ipos").select("slug, payload").eq("published", true);
    if (error) throw new DataProviderError("Could not load IPO list", this.name, error);
    return (data ?? []).map((r) => this.parse(r));
  }

  async getIpo(slug: string): Promise<Ipo | null> {
    const { data, error } = await this.client
      .from("ipos")
      .select("slug, payload")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new DataProviderError(`Could not load IPO "${slug}"`, this.name, error);
    return data ? this.parse(data) : null;
  }
}
