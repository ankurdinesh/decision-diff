import type { DecisionDiffReport, InsightItem } from "@/lib/types";

const sections: Array<[keyof Omit<DecisionDiffReport, "executiveSummary">, string]> = [
  ["changedAssumptions", "Changed assumptions"],
  ["newRisks", "New risks"],
  ["removedRisks", "Removed risks"],
  ["productTradeoffs", "Product tradeoffs"],
  ["decisionsReversed", "Decisions reversed"],
  ["newOpportunities", "New opportunities"],
  ["unansweredQuestions", "Questions that remain unanswered"]
];

export function buildMarkdownReport(report: DecisionDiffReport) {
  const body = sections
    .map(([key, title]) => renderSection(title, report[key]))
    .join("\n\n");

  return `# Decision Diff Executive Summary

## ${report.executiveSummary.headline}

${report.executiveSummary.narrative}

**Recommended next step:** ${report.executiveSummary.recommendedNextStep}

${body}
`;
}

function renderSection(title: string, items: InsightItem[]) {
  if (items.length === 0) {
    return `## ${title}\n\nNo material movement identified.`;
  }

  const bullets = items
    .map((item) => `- **${item.title}** (${item.significance}): ${item.detail}`)
    .join("\n");

  return `## ${title}\n\n${bullets}`;
}
