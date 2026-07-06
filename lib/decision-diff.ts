import OpenAI from "openai";
import type { ExtractedDocument } from "@/lib/document-extraction";
import { generateLocalDecisionDiffReport } from "@/lib/local-decision-diff";
import { buildDecisionDiffPrompt } from "@/lib/prompts";
import { classifyProviderError, isFallbackEligible } from "@/lib/provider-errors";
import { decisionDiffReportSchema } from "@/lib/report-schema";

const DEFAULT_MODEL = "gpt-4o";

export async function generateDecisionDiffReport(
  before: ExtractedDocument,
  after: ExtractedDocument
) {
  if (process.env.ANALYSIS_MODE === "local") {
    return generateLocalDecisionDiffReport(before, after);
  }

  const apiKey = process.env.OPENAI_API_KEY ?? process.env.LLM_API_KEY;
  if (!apiKey) {
    if (process.env.ENABLE_LOCAL_FALLBACK === "true") {
      return generateLocalDecisionDiffReport(before, after);
    }

    throw new Error("OPENAI_API_KEY or LLM_API_KEY is not configured on the server.");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL ?? process.env.LLM_BASE_URL
  });
  let completion;

  try {
    completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? process.env.LLM_MODEL ?? DEFAULT_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You produce rigorous executive summaries of reasoning differences between business documents."
        },
        {
          role: "user",
          content: buildDecisionDiffPrompt(before, after)
        }
      ]
    });
  } catch (error) {
    const providerError = classifyProviderError(error);
    if (process.env.ENABLE_LOCAL_FALLBACK === "true" && isFallbackEligible(providerError.kind)) {
      return generateLocalDecisionDiffReport(before, after);
    }

    throw error;
  }

  const content = completion.choices[0]?.message.content;
  if (!content) {
    throw new Error("The model returned an empty response.");
  }

  const parsed = decisionDiffReportSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    throw new Error("The model response could not be validated. Please retry.");
  }

  return parsed.data;
}
