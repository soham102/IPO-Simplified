import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const body = z.object({
  page: z.string().max(300).startsWith("/"),
  context: z.string().max(200).optional().default(""),
  field: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(2000),
  sourceUrl: z.union([z.literal(""), z.url().max(500)]).optional().default(""),
  email: z.union([z.literal(""), z.email().max(200)]).optional().default(""),
  website: z.string().max(0).optional(), // honeypot: must be empty
});

/**
 * Accepts correction reports. Stored in Supabase `error_reports` when
 * configured; otherwise logged server-side (visible in hosting logs).
 */
export async function POST(req: Request) {
  if (!rateLimit(`report:${clientIp(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many reports. Please try again later." }, { status: 429 });
  }
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid report" }, { status: 400 });
  }
  const { website: _honeypot, ...report } = parsed.data;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase.from("error_reports").insert({
      page: report.page,
      context: report.context,
      field: report.field,
      description: report.description,
      source_url: report.sourceUrl || null,
      email: report.email || null,
    });
    if (error) {
      console.error("[report-error] insert failed", error.message);
      return NextResponse.json({ ok: false, error: "Could not save your report. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, via: "database" });
  }

  console.info("[report-error]", JSON.stringify({ ...report, email: report.email ? "(provided)" : "", at: new Date().toISOString() }));
  return NextResponse.json({ ok: true, via: "log" });
}
