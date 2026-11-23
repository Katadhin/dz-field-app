import Anthropic from "@anthropic-ai/sdk";
import { buildSystem } from "./sorterConfig";

const DEFAULT_MODEL = "claude-haiku-5-5";

const TOOL = {
  name: "record_entries",
  description: "Return the structured entries extracted from the visit note.",
  input_schema: {
    type: "object",
    properties: {
      entries: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string", description: "one label name from the LABELS list" },
            vendor: { type: "string", description: "one vendor from the VENDORS list, or unknown" },
            rep_words: { type: "string", description: "the rep's own words for this entry" },
            confidence: { type: "number", description: "0 to 1" },
          },
          required: ["label", "vendor", "rep_words", "confidence"],
        },
      },
    },
    required: ["entries"],
  },
};

export function sorterReady() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Sends one note to Claude and returns an array of structured entries.
// Never saves anything and never computes counts: it only tags and extracts.
export async function sortNote(noteText, { corrections = [] } = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const client = new Anthropic({ apiKey });

  const res = await client.messages.create({
    model,
    max_tokens: 1500,
    system: buildSystem(corrections),
    tools: [TOOL],
    tool_choice: { type: "tool", name: "record_entries" },
    messages: [{ role: "user", content: noteText }],
  });

  const block = (res.content || []).find((b) => b.type === "tool_use");
  const entries = (block && block.input && block.input.entries) || [];
  return entries.map((e) => ({
    label: String(e.label || "other"),
    vendor: String(e.vendor || "unknown"),
    rep_words: String(e.rep_words || ""),
    confidence: typeof e.confidence === "number" ? e.confidence : 0.5,
  }));
}
