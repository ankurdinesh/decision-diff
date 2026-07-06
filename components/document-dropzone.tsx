"use client";

import { FileText, Upload } from "lucide-react";

type DocumentDropzoneProps = {
  file: File | null;
  label: string;
  onChange: (file: File | null) => void;
};

const supportedTypes = ".pdf,.docx,.txt,.md,.markdown,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function DocumentDropzone({ file, label, onChange }: DocumentDropzoneProps) {
  return (
    <label className="dropzone">
      <input
        type="file"
        accept={supportedTypes}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <span className="dropzone-label">{label}</span>
      <span className="dropzone-icon" aria-hidden="true">
        {file ? <FileText size={24} strokeWidth={1.8} /> : <Upload size={24} strokeWidth={1.8} />}
      </span>
      <span className="dropzone-name">{file ? file.name : "Drop or choose a document"}</span>
      <span className="dropzone-meta">
        {file
          ? `${formatBytes(file.size)} selected`
          : "PDF, DOCX, TXT, and Markdown are supported."}
      </span>
    </label>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
