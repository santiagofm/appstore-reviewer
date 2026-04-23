import {
  getApps,
  getLastPolled,
  insertOrIgnoreApp,
  updateAppName,
  updateLastPolled,
  upsertReview,
  getDb,
} from "./db";
import { fetchRssPage, parseReviews } from "./rss";

const MAX_PAGES = 10;
const POLL_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours

export async function pollApp(appId: string): Promise<void> {
  insertOrIgnoreApp(appId);

  for (let page = 1; page <= MAX_PAGES; page++) {
    const isFirstPage = page === 1;
    let entries;

    try {
      entries = await fetchRssPage(appId, page);
    } catch (err) {
      console.error(
        `[poller] Failed to fetch page ${page} for app ${appId}:`,
        err,
      );
      break;
    }

    if (entries.length === 0) break;

    // Backfill app name from metadata entry on page 1
    if (isFirstPage && entries[0]?.["im:name"]) {
      updateAppName(appId, entries[0]["im:name"]!.label);
    }

    const reviews = parseReviews(entries, appId, isFirstPage);
    if (reviews.length === 0) break;

    const cutoff = Date.now() - WINDOW_MS;
    const withinWindow = reviews.filter((r) => r.submitted_at >= cutoff);
    const allOld = withinWindow.length === 0;

    // On pages after the first, stop if every review in this page is already stored
    if (page > 1) {
      const db = getDb();
      const allKnown = reviews.every((r) => {
        const row = db
          .prepare("SELECT 1 FROM reviews WHERE app_id = ? AND review_id = ?")
          .get(r.app_id, r.review_id);
        return row !== undefined;
      });
      if (allKnown) break;
    }

    for (const review of reviews) {
      upsertReview(review);
    }

    if (allOld) break;
  }

  updateLastPolled(appId);
  console.log(`[poller] Polled app ${appId}`);
}

export async function pollAllTrackedApps(): Promise<void> {
  const apps = getApps();
  const now = Date.now();

  for (const app of apps) {
    const lastPolled = app.last_polled_at;
    if (lastPolled && now - lastPolled < POLL_COOLDOWN_MS) {
      console.log(
        `[poller] Skipping ${app.app_id} (polled ${Math.round((now - lastPolled) / 1000)}s ago)`,
      );
      continue;
    }
    await pollApp(app.app_id);
  }
}
