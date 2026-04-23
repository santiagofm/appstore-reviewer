# App Store Reviews Viewer

A full-stack app that polls Apple's App Store RSS feed for iOS app reviews, stores them persistently in SQLite, and displays them in a React UI. Search for any app by name, track multiple apps, and browse reviews across different time windows.

## Prerequisites

- Node.js 22 (LTS) — use `nvm use` to switch automatically via `.nvmrc`
- npm 8+ (workspaces support)

## Setup

```bash
# From the repo root — installs deps for both backend and frontend
npm install

# Start both servers (backend on :3001, frontend on :5173)
npm run dev
```

Then open http://localhost:5173.

## Usage

- **Search** for an iOS app by name using the header search bar. Selecting a result registers the app and fetches its reviews immediately.
- **Watching sidebar** shows all tracked apps. Click any to load its reviews. Use the delete button to stop tracking.
- **Time range** toggle (48h / Last week / Last month) filters reviews without re-polling.
- Reviews are displayed newest first, with author, star rating, title, and relative timestamp.

Example app IDs to try: `595068606` · `447188370` (Snapchat)

## Other scripts

```bash
npm run test      # run backend unit tests
```

## Architecture

```
frontend (Vite + React + Ant Design)
    │  POST /api/apps/:appId      — register app + initial poll
    │  GET  /api/apps             — list tracked apps
    │  GET  /api/apps/:appId/reviews?hours=N
    │  GET  /api/search?term=...
    ▼
backend (Express + TypeScript)
    ├── routes/       REST handlers
    ├── poller.ts     fetch Apple RSS pages, upsert reviews
    ├── scheduler.ts  node-cron — polls all tracked apps every 15 min
    ├── rss.ts        fetch + parse Apple RSS JSON feed
    └── db.ts         better-sqlite3 — apps + reviews tables
```

**Polling strategy**: walks Apple's paginated RSS feed (up to 10 pages × 50 reviews). Stops early when all reviews on a page are older than 48h, or when all reviews are already in the DB. Subsequent requests re-poll only if the app hasn't been polled in the last 15 minutes.

**Persistence**: reviews are stored in `backend/data.db` (SQLite). Stopping and restarting the backend preserves all data. Re-polling is idempotent — reviews are keyed by `(app_id, review_id)` so duplicates are silently ignored.

To reset: `rm backend/data.db`

## Assumptions

- Apple's RSS feed is used as-is (public, no auth). It returns up to 500 reviews per app (10 pages × 50).
- Review IDs from the feed are treated as unique per app (composite primary key) rather than globally unique.
- App names are resolved via the iTunes Lookup API (`/lookup?id=`) since the RSS feed contains no app metadata.
- The 15-minute poll cooldown applies per-app; the cron job and the on-demand review endpoint both respect it.
- The Apple RSS feed is limited to 500 reviews per app (10 pages × 50). For very high-volume apps, reviews older than the newest 500 within the 48h window may not be captured.
