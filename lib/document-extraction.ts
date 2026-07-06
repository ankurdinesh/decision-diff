const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_TEXT_CHARS = 120_000;

export type ExtractedDocument = {
  fileName: string;
  mimeType: string;
  text: string;
};

export async function extractDocument(file: File): Promise<ExtractedDocument> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${file.name} is larger than the 25 MB limit.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || inferMimeType(file.name);
  const text = await extractText(buffer, file.name, mimeType);

  if (text.trim().length < 120) {
    throw new Error(`${file.name} does not contain enough readable text to compare.`);
  }

  return {
    fileName: file.name,
    mimeType,
    text: normalizeText(text).slice(0, MAX_TEXT_CHARS)
  };
}

async function extractText(buffer: Buffer, fileName: string, mimeType: string) {
  if (mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.toLowerCase().endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return buffer.toString("utf-8");
}

function inferMimeType(fileName: string) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".pdf")) return "application/pdf";
  if (lowerName.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lowerName.endsWith(".md") || lowerName.endsWith(".markdown")) return "text/markdown";
  return "text/plain";
}

function normalizeText(value: string) {
  return value.replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
