# d&z Field App

A phone-first app for dz retail reps to log Food Lion store visits by voice, capture photos, track follow-ups, and produce vendor reports. Reps talk after a visit; the app turns that talk into clean, vendor-tagged records.

This repo is at **Session 1**: a live landing page in the dz colors with a connected Postgres database. The build order and architecture live in `docs/`.

## The stack

Next.js (React) on Render, with a managed Postgres database. Later sessions add Cloudflare R2 for photos, a speech-to-text service, and the Claude API for sorting notes. See `docs/ARCHITECTURE.md`.

## Run it locally

```
npm install
cp .env.example .env.local   # optional: set a local DATABASE_URL
npm run dev
```

Open http://localhost:3000. Without a database the page still loads and shows "No database configured yet"; with one it shows "Database connected".

## Deploy to Render

This repo ships a `render.yaml` Blueprint. In Render, choose New then Blueprint, point it at this repo, and Render creates the web service and the Postgres database together and wires `DATABASE_URL` in for you. Open the service URL on your phone to finish Session 1.

## The rules that never bend

Secrets live only in Render environment variables. Counts come from the database, never from the AI. One vendor's data never appears in another vendor's report. Every vendor deck gets a human check before it goes out. Merge only what you have tested on your phone. The full rulebook is in `CLAUDE.md`, which every Claude Code session reads first.

## What's in `docs/`

- `ARCHITECTURE.md` — the whole system and why each choice was made.
- `BRAND.md` — the dz palette and wordmark.
- `PRE-BUILD-CHECKLIST.md` — decisions and accounts to settle.
- `SESSION-PROMPTS.md` — paste-ready prompts for every build session.
- `rep-notes-template.csv` — where the sorter's test notes get collected.
