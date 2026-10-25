import type { Citation } from "@/lib/types";

export const TOPICS = ["overview", "financials", "valuation", "risks"] as const;
export type Topic = (typeof TOPICS)[number];

export const TOPIC_LABEL: Record<Topic, string> = {
  overview: "Overall picture",
  financials: "Financial health",
  valuation: "Valuation",
  risks: "Risks",
};

export interface ExplainItem {
  text: string;
  citations: Citation[];
}

export interface Explanation {
  mode: "ai" | "deterministic";
  topic: Topic;
  model?: string;
  generatedAt: string;
  summary: string;
  facts: ExplainItem[];
  interpretations: ExplainItem[];
  unknowns: string[];
  notice?: string;
}
