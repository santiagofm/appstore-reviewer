# App Store Reviews Viewer

Polls Apple's App Store RSS feed for iOS app reviews, stores them in SQLite, and displays the last 48 hours in a React UI.

## Setup

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Frontend runs at http://localhost:5173 · Backend at http://localhost:3001

## Usage

Search for any iOS app by name, or paste a raw App Store app ID. Reviews from the last 48 hours are displayed newest first. The sidebar shows all apps currently being tracked.

Example app IDs: `595068606` · `447188370` (Snapchat)

## Persistence

Reviews are stored in `backend/data.db` (SQLite). Stopping and restarting the backend preserves all data. Delete `data.db` to reset.
