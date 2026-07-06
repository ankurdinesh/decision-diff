# Decision Diff

Decision Diff is a polished Next.js application for comparing two decision documents at the reasoning level. It uses an LLM to identify changed assumptions, new and removed risks, tradeoffs, reversed decisions, new opportunities, and unanswered questions, then presents the result as an executive summary with Markdown export.

## Problem

Decision documents change for reasons that are easy to miss in a line-by-line diff.
A standard text diff can show that wording changed, but it does not explain whether the
underlying decision logic shifted.

Decision Diff focuses on the reasoning layer:

- Which assumptions changed?
- Which risks appeared or disappeared?
- Which tradeoffs became more important?
- Which decisions were reversed?
- Which opportunities and open questions are now visible?

The goal is to produce a board-ready summary that helps teams understand what changed
in the thinking, not just what changed in the text.

## Example Screenshots
<img width="1492" height="815" alt="Screenshot 2026-07-06 at 23 07 45" src="https://github.com/user-attachments/assets/ed433a64-0c67-4bf0-912e-0c53f1ff2498" />

<img width="1492" height="815" alt="Screenshot 2026-07-06 at 23 08 08" src="https://github.com/user-attachments/assets/ba066ce7-f97a-44d9-8f88-0f6ccb02bda9" />

<img width="1492" height="815" alt="Screenshot 2026-07-06 at 23 08 24" src="https://github.com/user-attachments/assets/d8e73d76-26d5-4a4d-b243-ad28a2a8505d" />

Suggested screenshots:

- Upload screen with the original and revised document dropzones.
- Completed executive summary.
- Insight category cards showing changed assumptions, risks, tradeoffs, and open questions.

You can use the synthetic files in `test-fixtures` to generate a repeatable demo report.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000.

## Configuration

For full AI analysis, create `.env.local` from `.env.example` and add your own OpenAI
API key:

```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o
```

You can also use an OpenAI-compatible provider:

```bash
LLM_API_KEY=your_provider_key
LLM_BASE_URL=https://api.your-provider.example/v1
LLM_MODEL=your-model-name
```

This project reads the key only on the server in the `/api/analyze` route. Do not commit
`.env.local`; it is ignored by git.

For local testing without provider spend, or when the provider account is out of quota:

```bash
# Always use the deterministic local analyzer instead of OpenAI.
ANALYSIS_MODE=local

# Or keep OpenAI as primary and fall back locally on quota/rate/provider failures.
ENABLE_LOCAL_FALLBACK=true
```

The local analyzer is intended for demos and smoke tests. It compares document headings
and bullets deterministically, so it is cheaper and always available, but less nuanced
than the model-backed analysis.

The upload flow supports PDF, DOCX, TXT, and Markdown files up to 25 MB each.

## Architecture

Decision Diff is a small Next.js app with a server-side analysis route.

- `app/page.tsx`: client UI for uploading the original and revised documents, submitting analysis, rendering the report, and exporting Markdown.
- `app/api/analyze/route.ts`: server route that receives uploaded files, extracts text, calls the analyzer, and returns structured JSON.
- `lib/document-extraction.ts`: extracts readable text from PDF, DOCX, Markdown, and plain text files.
- `lib/decision-diff.ts`: provider-backed analysis path using the OpenAI SDK. It supports OpenAI and OpenAI-compatible providers.
- `lib/local-decision-diff.ts`: deterministic local fallback for demos, smoke tests, and provider quota failures.
- `lib/prompts.ts`: prompt template for the model-backed reasoning comparison.
- `lib/report-schema.ts`: Zod schema that validates the model response before it reaches the UI.
- `lib/markdown.ts`: converts a structured report into an exportable Markdown summary.

The app keeps LLM credentials server-side only. Browser code uploads documents to
`/api/analyze`; the API route reads environment variables and calls the configured
provider.

## Prompt Engineering

The model prompt asks for a reasoning-level comparison rather than a textual diff.
It explicitly instructs the model to focus on:

- changed assumptions
- new risks
- removed risks
- product tradeoffs
- reversed decisions
- new opportunities
- unanswered questions

The prompt requires strict JSON with a fixed shape. The server then validates the response
with Zod before sending it to the frontend. This keeps the UI predictable and avoids
rendering malformed model output.

The prompt also pushes for concise executive language:

- specific and evidence-based
- fewer, sharper bullets
- empty arrays when a category has no material change
- short details suitable for a summary card

For local or quota-constrained testing, `ANALYSIS_MODE=local` bypasses the LLM and uses
a deterministic section-and-bullet comparison. That path is less nuanced but useful for
testing the product flow without provider spend.

## Test Fixtures

The `test-fixtures` folder contains two synthetic Markdown files you can upload to test
the comparison flow without preparing documents:

- `original-decision-memo.md`
- `revised-decision-memo.md`

## Future Ideas

- Add user-owned provider keys through a settings screen or encrypted server-side storage.
- Support more providers with first-class configuration presets.
- Add streaming progress states for extraction, analysis, validation, and report rendering.
- Add screenshot assets and a hosted demo.
- Add side-by-side evidence snippets for each generated insight.
- Add organization-level usage limits and request logging.
- Add automated tests for document extraction, provider error handling, and local fallback output.
- Add deployment examples for Vercel, Render, and Docker.

#ai #llm #product-management #decision-making #executive
