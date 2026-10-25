import type { DataMode, Ipo } from "@/lib/types";

/**
 * Contract every data source implements. The UI depends only on this
 * interface, so a licensed data provider can be added as a new adapter
 * without touching pages or components.
 */
export interface IpoDataProvider {
  readonly name: string;
  readonly mode: DataMode;
  listIpos(): Promise<Ipo[]>;
  getIpo(slug: string): Promise<Ipo | null>;
}

/** Thrown when a provider cannot return trustworthy data. Never swallowed into mock data. */
export class DataProviderError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DataProviderError";
  }
}
