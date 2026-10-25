import { NextResponse } from "next/server";
import { z } from "zod";
import { explain } from "@/lib/ai/claude";
import { TOPICS } from "@/lib/ai/topics";
import { DataProviderError, getIpo } from "@/lib/data";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const body = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,100}$/),
  topic: z.enum(TOPICS),
});

export async function POST(req: Request) {
  if (!rateLimit(`explain:${clientIp(req)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute and try again." }, { status: 429 });
  }
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const ipo = await getIpo(parsed.data.slug);
    if (!ipo) return NextResponse.json({ error: "IPO not found" }, { status: 404 });
    const result = await explain(ipo, parsed.data.topic);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof DataProviderError) {
      return NextResponse.json({ error: "IPO data is temporarily unavailable" }, { status: 503 });
    }
    console.error("[api/explain]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
