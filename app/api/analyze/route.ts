import { NextResponse } from "next/server";
import { generateDecisionDiffReport } from "@/lib/decision-diff";
import { extractDocument } from "@/lib/document-extraction";
import { classifyProviderError } from "@/lib/provider-errors";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const beforeFile = formData.get("before");
    const afterFile = formData.get("after");

    if (!(beforeFile instanceof File) || !(afterFile instanceof File)) {
      return NextResponse.json(
        { error: "Upload both the original and revised documents." },
        { status: 400 }
      );
    }

    const [before, after] = await Promise.all([
      extractDocument(beforeFile),
      extractDocument(afterFile)
    ]);

    const report = await generateDecisionDiffReport(before, after);
    return NextResponse.json({ report });
  } catch (error) {
    const providerError = classifyProviderError(error);
    const message =
      providerError.kind === "unknown" && error instanceof Error
        ? error.message
        : providerError.message;

    return NextResponse.json({ error: message }, { status: providerError.status });
  }
}
