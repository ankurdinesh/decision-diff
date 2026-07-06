import type { ExtractedDocument } from "@/lib/document-extraction";
import type { DecisionDiffReport, InsightItem, Significance } from "@/lib/types";

const MAX_ITEMS = 4;

export function generateLocalDecisionDiffReport(
  before: ExtractedDocument,
  after: ExtractedDocument
): DecisionDiffReport {
  const beforeSections = parseSections(before.text);
  const afterSections = parseSections(after.text);

  const beforeAssumptions = sectionItems(beforeSections, ["assumption"]);
  const afterAssumptions = sectionItems(afterSections, ["assumption"]);
  const beforeRisks = sectionItems(beforeSections, ["risk"]);
  const afterRisks = sectionItems(afterSections, ["risk"]);
  const afterTradeoffs = sectionItems(afterSections, ["tradeoff"]);
  const afterDecisions = sectionItems(afterSections, ["decision"]);
  const afterOpportunities = sectionItems(afterSections, ["opportunit"]);
  const afterQuestions = sectionItems(afterSections, ["question"]);

  const changedAssumptions = pairChangedItems(beforeAssumptions, afterAssumptions, "Assumption changed");
  const newRisks = uniqueItems(afterRisks, beforeRisks, "New risk", "High");
  const removedRisks = uniqueItems(beforeRisks, afterRisks, "Reduced or removed risk", "Medium");
  const productTradeoffs = toInsightItems(afterTradeoffs, "Product tradeoff", "Medium");
  const decisionsReversed = toInsightItems(
    afterDecisions.filter((item) => /revers|defer|moved|instead|no longer/i.test(item)),
    "Decision reversal",
    "High"
  );
  const newOpportunities = toInsightItems(afterOpportunities, "New opportunity", "Medium");
  const unansweredQuestions = toInsightItems(afterQuestions, "Unanswered question", "Medium");

  return {
    executiveSummary: {
      headline: "Local reasoning diff generated without provider access",
      narrative:
        "The AI provider was unavailable, so this report uses a deterministic section-and-bullet comparison. Treat it as a directional draft: it highlights likely movement in assumptions, risks, tradeoffs, decisions, opportunities, and open questions, but it is less nuanced than the model-backed analysis.",
      recommendedNextStep:
        "Review the highlighted items, then rerun the analysis after provider quota or rate limits are restored."
    },
    changedAssumptions,
    newRisks,
    removedRisks,
    productTradeoffs,
    decisionsReversed,
    newOpportunities,
    unansweredQuestions
  };
}

type Section = {
  heading: string;
  lines: string[];
};

function parseSections(text: string) {
  const sections: Section[] = [{ heading: "document", lines: [] }];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      sections.push({ heading: heading[1].toLowerCase(), lines: [] });
      continue;
    }

    sections[sections.length - 1].lines.push(cleanListPrefix(line));
  }

  return sections;
}

function sectionItems(sections: Section[], headingTerms: string[]) {
  return sections
    .filter((section) => headingTerms.some((term) => section.heading.includes(term)))
    .flatMap((section) => section.lines)
    .filter((line) => line.length > 20)
    .slice(0, 12);
}

function uniqueItems(source: string[], comparison: string[], titlePrefix: string, significance: Significance) {
  const comparisonKeys = comparison.map(normalizeForComparison);
  return toInsightItems(
    source.filter((item) => !comparisonKeys.includes(normalizeForComparison(item))),
    titlePrefix,
    significance
  );
}

function pairChangedItems(before: string[], after: string[], titlePrefix: string) {
  const paired: InsightItem[] = [];
  const max = Math.min(before.length, after.length, MAX_ITEMS);

  for (let index = 0; index < max; index += 1) {
    if (normalizeForComparison(before[index]) === normalizeForComparison(after[index])) continue;

    paired.push({
      title: `${titlePrefix} ${index + 1}`,
      detail: `From "${truncate(before[index], 90)}" to "${truncate(after[index], 90)}".`,
      significance: index < 2 ? "High" : "Medium"
    });
  }

  if (paired.length > 0) return paired;

  return uniqueItems(after, before, titlePrefix, "Medium");
}

function toInsightItems(items: string[], titlePrefix: string, significance: Significance): InsightItem[] {
  return items.slice(0, MAX_ITEMS).map((item, index) => ({
    title: `${titlePrefix} ${index + 1}`,
    detail: truncate(item, 150),
    significance
  }));
}

function cleanListPrefix(line: string) {
  return line.replace(/^[-*]\s+/, "").replace(/^\d+[.)]\s+/, "").trim();
}

function normalizeForComparison(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}...`;
}
