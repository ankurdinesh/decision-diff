import type { ExtractedDocument } from "@/lib/document-extraction";

export function buildDecisionDiffPrompt(before: ExtractedDocument, after: ExtractedDocument) {
  return `You are a senior strategy consultant preparing a McKinsey-style executive summary.

Compare the reasoning in two documents. Do not produce a textual diff. Focus only on what changed in decision logic, strategic assumptions, risks, tradeoffs, reversals, opportunities, and unresolved questions.

Return strict JSON with this shape:
{
  "executiveSummary": {
    "headline": "concise answer-first headline",
    "narrative": "2-4 sentence executive synthesis in polished consulting language",
    "recommendedNextStep": "specific next action"
  },
  "changedAssumptions": [{ "title": "...", "detail": "...", "significance": "High|Medium|Low" }],
  "newRisks": [{ "title": "...", "detail": "...", "significance": "High|Medium|Low" }],
  "removedRisks": [{ "title": "...", "detail": "...", "significance": "High|Medium|Low" }],
  "productTradeoffs": [{ "title": "...", "detail": "...", "significance": "High|Medium|Low" }],
  "decisionsReversed": [{ "title": "...", "detail": "...", "significance": "High|Medium|Low" }],
  "newOpportunities": [{ "title": "...", "detail": "...", "significance": "High|Medium|Low" }],
  "unansweredQuestions": [{ "title": "...", "detail": "...", "significance": "High|Medium|Low" }]
}

Rules:
- Be specific and evidence-based, but do not quote long passages.
- Prefer fewer, sharper bullets over exhaustive lists.
- Use empty arrays when no material change exists.
- Write for executives who need implications, not implementation details.
- Keep each detail under 40 words.

Original document (${before.fileName}):
"""${before.text}"""

Revised document (${after.fileName}):
"""${after.text}"""`;
}
