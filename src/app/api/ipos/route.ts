import { NextResponse } from "next/server";
import { configuredDataMode, DataProviderError, listSummaries } from "@/lib/data";

/** Read-only JSON list of IPO summaries. Every value carries its source and verification status. */
export async function GET() {
  try {
    const items = await listSummaries();
    return NextResponse.json({ dataMode: configuredDataMode(), count: items.length, items });
  } catch (err) {
    if (err instanceof DataProviderError) {
      return NextResponse.json({ error: "IPO data is temporarily unavailable" }, { status: 503 });
    }
    throw err;
  }
}
