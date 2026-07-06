"use client";

type StatusPillProps = {
  hasReport: boolean;
  isLoading: boolean;
};

export function StatusPill({ hasReport, isLoading }: StatusPillProps) {
  const label = isLoading ? "Analyzing" : hasReport ? "Summary ready" : "Ready";

  return (
    <span className="status-pill">
      <span className="status-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
