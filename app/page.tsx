"use client";

import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { DocumentDropzone } from "@/components/document-dropzone";
import { InsightCard } from "@/components/insight-card";
import { MarkdownExportButton } from "@/components/markdown-export-button";
import { StatusPill } from "@/components/status-pill";
import { buildMarkdownReport } from "@/lib/markdown";
import type { DecisionDiffReport } from "@/lib/types";

const categoryLabels: Array<{
  key: keyof Pick<
    DecisionDiffReport,
    | "changedAssumptions"
    | "newRisks"
    | "removedRisks"
    | "productTradeoffs"
    | "decisionsReversed"
    | "newOpportunities"
    | "unansweredQuestions"
  >;
  title: string;
  tone?: "risk" | "opportunity" | "tradeoff";
}> = [
  { key: "changedAssumptions", title: "Changed assumptions" },
  { key: "newRisks", title: "New risks", tone: "risk" },
  { key: "removedRisks", title: "Removed risks" },
  { key: "productTradeoffs", title: "Product tradeoffs", tone: "tradeoff" },
  { key: "decisionsReversed", title: "Decisions reversed", tone: "risk" },
  { key: "newOpportunities", title: "New opportunities", tone: "opportunity" },
  { key: "unansweredQuestions", title: "Unanswered questions", tone: "tradeoff" }
];

export default function Home() {
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [report, setReport] = useState<DecisionDiffReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canAnalyze = Boolean(beforeFile && afterFile && !isLoading);

  const markdown = useMemo(() => {
    return report ? buildMarkdownReport(report) : "";
  }, [report]);

  async function analyzeDocuments() {
    if (!beforeFile || !afterFile) {
      setError("Upload both documents to run the comparison.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    const formData = new FormData();
    formData.append("before", beforeFile);
    formData.append("after", afterFile);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as
        | { report: DecisionDiffReport }
        | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Unable to analyze documents.");
      }

      setReport(payload.report);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while analyzing the documents."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="shell">
        <nav className="topbar" aria-label="Application">
          <div className="brand">
            <span className="brand-mark">D</span>
            <span>Decision Diff</span>
          </div>
          <div className="topbar-copy">Reasoning-level comparison for executive decisions.</div>
        </nav>

        <section className="hero">
          <div className="intro">
            <p className="eyebrow">Strategic document intelligence</p>
            <h1>Compare what changed in the thinking.</h1>
            <p className="lede">
              Upload two decision documents and generate a concise executive summary of
              assumption shifts, risk movement, reversals, tradeoffs, opportunities, and
              unanswered questions.
            </p>

            <div className="metrics-strip" aria-label="Analysis coverage">
              <div className="metric">
                <strong>7</strong>
                <span>reasoning categories reviewed across both documents</span>
              </div>
              <div className="metric">
                <strong>0</strong>
                <span>line-by-line diff noise in the final recommendation</span>
              </div>
              <div className="metric">
                <strong>MD</strong>
                <span>exportable markdown for decks, memos, and review notes</span>
              </div>
            </div>
          </div>

          <section className="workspace" aria-label="Upload documents">
            <div className="workspace-header">
              <h2 className="workspace-title">Document pair</h2>
              <StatusPill isLoading={isLoading} hasReport={Boolean(report)} />
            </div>

            <div className="form">
              <div className="dropzone-grid">
                <DocumentDropzone
                  file={beforeFile}
                  label="Original document"
                  onChange={setBeforeFile}
                />
                <DocumentDropzone
                  file={afterFile}
                  label="Revised document"
                  onChange={setAfterFile}
                />
              </div>

              <div className="actions">
                <button
                  className="primary-button"
                  type="button"
                  disabled={!canAnalyze}
                  onClick={analyzeDocuments}
                >
                  <Sparkles size={17} strokeWidth={2} />
                  {isLoading ? "Analyzing..." : "Analyze reasoning changes"}
                </button>
                <MarkdownExportButton markdown={markdown} disabled={!report} />
              </div>

              {error ? (
                <p className="error-text" role="alert">
                  {error}
                </p>
              ) : (
                <p className="helper-text">
                  Supports PDF, DOCX, TXT, and Markdown. Keep each document under 25 MB.
                </p>
              )}
            </div>
          </section>
        </section>

        {report ? (
          <section className="results" aria-label="Decision diff results">
            <div className="section-heading">
              <h2>Executive summary</h2>
              <p>
                Structured as a board-ready readout: thesis, implications, and specific
                movements in the decision logic.
              </p>
            </div>

            <article className="summary-panel">
              <h3>{report.executiveSummary.headline}</h3>
              <p>{report.executiveSummary.narrative}</p>
              <p>
                <strong>Recommended next step: </strong>
                {report.executiveSummary.recommendedNextStep}
              </p>
            </article>

            <div className="insight-grid">
              {categoryLabels.map((category) => (
                <InsightCard
                  key={category.key}
                  title={category.title}
                  tone={category.tone}
                  items={report[category.key]}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
