import { SAMPLE_COMPANIES } from "@/data/sample/companies";
import { dateCtx } from "@/data/sample/kit";
import { todayIST } from "@/lib/format";
import type { Ipo } from "@/lib/types";
import type { IpoDataProvider } from "./provider";

/** Fictional sample data. Rebuilt per call so date-relative statuses stay current. */
export class MockProvider implements IpoDataProvider {
  readonly name = "Sample dataset (fictional)";
  readonly mode = "sample" as const;

  constructor(private readonly today: () => string = () => todayIST()) {}

  private build(): Ipo[] {
    const ctx = dateCtx(this.today());
    return SAMPLE_COMPANIES.map((make) => make(ctx));
  }

  async listIpos(): Promise<Ipo[]> {
    return this.build();
  }

  async getIpo(slug: string): Promise<Ipo | null> {
    return this.build().find((i) => i.slug === slug) ?? null;
  }
}
