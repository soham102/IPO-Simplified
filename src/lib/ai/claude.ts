import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { Ipo } from "@/lib/types";
import {
  aiOutputSchema,
  buildFactPack,
  buildUserMessage,
  deterministicExplanation,
  SYSTEM_PROMPT,
  validateAiOutput,
  type Explanation,
  type Topic,
} from "./explain-core";

export const aiConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);
const MODEL = () => process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 60_000, maxRetries: 1 }));

/** Cache by slug + topic + record review time, so edits to the data invalidate it. */
const cache = new Map<string, { at: number; value: Explanation }>();
const TTL_MS = 6 * 3600 * 1000;

/**
 * Explain a topic with Claude, constrained to the cited fact pack. On any
 * failure the deterministic explanation is returned with a notice; we never
 * show unvalidated model output.
 */
export async function explain(ipo: Ipo, topic: Topic): Promise<Explanation> {
  if (!aiConfigured()) return deterministicExplanation(ipo, topic);

  const key = `${ipo.slug}:${topic}:${ipo.lastReviewed}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  const facts = buildFactPack(ipo, topic);
  const model = MODEL();
  try {
    const response = await getClient().beta.messages.parse({
      model,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(aiOutputSchema) },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(ipo, topic, facts) }],
    });

    if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens" || !response.parsed_output) {
      return deterministicExplanation(ipo, topic, "The AI explanation was unavailable, so this rule-based explanation is shown instead.");
    }
    const out = response.parsed_output;
    const checked = validateAiOutput(out, facts);
    if (!checked.ok) {
      return deterministicExplanation(ipo, topic, "The AI explanation did not meet our accuracy rules, so this rule-based explanation is shown instead.");
    }
    const value: Explanation = {
      mode: "ai",
      topic,
      model: response.model,
      generatedAt: new Date().toISOString(),
      summary: out.summary,
      facts: checked.facts,
      interpretations: checked.interpretations,
      unknowns: out.unknowns,
    };
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return deterministicExplanation(ipo, topic, "The AI service is busy right now, so this rule-based explanation is shown instead.");
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("[ai] authentication failed: check ANTHROPIC_API_KEY");
    } else if (err instanceof Anthropic.APIError) {
      console.error(`[ai] API error ${err.status}: ${err.message}`);
    } else {
      console.error("[ai] unexpected error", err);
    }
    return deterministicExplanation(ipo, topic, "The AI explanation could not be generated, so this rule-based explanation is shown instead.");
  }
}
