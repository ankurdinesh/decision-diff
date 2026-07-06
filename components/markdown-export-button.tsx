"use client";

import { Download } from "lucide-react";

type MarkdownExportButtonProps = {
  disabled: boolean;
  markdown: string;
};

export function MarkdownExportButton({ disabled, markdown }: MarkdownExportButtonProps) {
  function exportMarkdown() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "decision-diff-summary.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button className="secondary-button" type="button" disabled={disabled} onClick={exportMarkdown}>
      <Download size={17} strokeWidth={2} />
      Export Markdown
    </button>
  );
}
