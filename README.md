# Decision Diff

Decision Diff is a polished Next.js application for comparing two decision documents at the reasoning level. It uses an LLM to identify changed assumptions, new and removed risks, tradeoffs, reversed decisions, new opportunities, and unanswered questions, then presents the result as an executive summary with Markdown export.

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

## Test Fixtures

The `test-fixtures` folder contains two synthetic Markdown files you can upload to test
the comparison flow without preparing documents:

- `original-decision-memo.md`
- `revised-decision-memo.md`
