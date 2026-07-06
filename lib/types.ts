export type Significance = "High" | "Medium" | "Low";

export type InsightItem = {
  title: string;
  detail: string;
  significance: Significance;
};

export type DecisionDiffReport = {
  executiveSummary: {
    headline: string;
    narrative: string;
    recommendedNextStep: string;
  };
  changedAssumptions: InsightItem[];
  newRisks: InsightItem[];
  removedRisks: InsightItem[];
  productTradeoffs: InsightItem[];
  decisionsReversed: InsightItem[];
  newOpportunities: InsightItem[];
  unansweredQuestions: InsightItem[];
};
