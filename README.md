# Text Summarizer

A small full-stack app that summarizes text into 3–5 bullet points using an LLM API.

## Features
- Paste text and get a clean bullet-point summary
- Character counter and input limit (20,000 characters)
- Clear error messages, including when the AI service is busy

## How it works
- **Frontend:** Next.js + TypeScript page (`app/page.tsx`)
- **Backend:** Next.js API route (`app/api/summarize/route.ts`) that validates input,
  calls the Gemini API, and returns the summary
- **Prompt engineering:** the prompt asks for plain-text bullets so the output displays cleanly
- **Security:** the API key lives in `.env.local` on the server; it is never sent to the browser or committed to Git
- **Reliability:** automatic retry with backoff when the AI service returns 503 or 429

## Run locally
1. `npm install`
2. Create `.env.local`: