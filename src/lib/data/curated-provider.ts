import { LIVE_IPOS } from "@/data/live/ipos";
import { ipoSchema } from "@/lib/schema";
import type { Ipo } from "@/lib/types";
import { DataProviderError, type IpoDataProvider } from "./provider";

/**
 * Real IPOs compiled by hand from public sources (see src/data/live/ipos.ts).
 * Every record is validated on load; an invalid record is an error, never shown.
 */
export class CuratedProvider implements IpoDataProvider {
  readonly name = "Curated public sources";
  readonly mode = "live" as const;
  private records: Ipo[];

  constructor(records: Ipo[] = LIVE_IPOS) {
    this.records = records.map((r) => {
      const res = ipoSchema.safeParse(r);
      if (!res.success) {
        const issue = res.error.issues[0];
        throw new DataProviderError(`Curated record "${r.slug}" is invalid: ${issue?.path.join(".")}: ${issue?.message}`, this.name);
      }
      return r;
    });
  }

  async listIpos(): Promise<Ipo[]> {
    return this.records;
  }

  async getIpo(slug: string): Promise<Ipo | null> {
    return this.records.find((r) => r.slug === slug) ?? null;
  }
}
