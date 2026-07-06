import { z } from "zod";

const significanceSchema = z.enum(["High", "Medium", "Low"]);

const insightItemSchema = z.object({
  title: z.string().min(1),
  detail: z.string().min(1),
  significance: significanceSchema
});

export const decisionDiffReportSchema = z.object({
  executiveSummary: z.object({
    headline: z.string().min(1),
    narrative: z.string().min(1),
    recommendedNextStep: z.string().min(1)
  }),
  changedAssumptions: z.array(insightItemSchema),
  newRisks: z.array(insightItemSchema),
  removedRisks: z.array(insightItemSchema),
  productTradeoffs: z.array(insightItemSchema),
  decisionsReversed: z.array(insightItemSchema),
  newOpportunities: z.array(insightItemSchema),
  unansweredQuestions: z.array(insightItemSchema)
});
