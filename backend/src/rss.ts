import type { Review, RssEntry } from "./types";

const RSS_BASE = "https://itunes.apple.com/us/rss/customerreviews";

interface RssFeed {
  feed: {
    entry?: RssEntry[];
  };
}

export async function fetchRssPage(
  appId: string,
  page: number,
): Promise<RssEntry[]> {
  const url = `${RSS_BASE}/id=${appId}/sortBy=mostRecent/page=${page}/json`;
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`RSS fetch failed: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as RssFeed;
  return data.feed.entry ?? [];
}

export function parseReviews(
  entries: RssEntry[],
  appId: string,
  isFirstPage: boolean,
): Review[] {
  // First entry on page 1 is app metadata, not a review — skip it
  const reviewEntries = isFirstPage ? entries.slice(1) : entries;

  return reviewEntries
    .filter((e) => e["im:rating"] !== undefined)
    .map((e) => ({
      app_id: appId,
      review_id: e.id.label,
      author: e.author.name.label,
      score: parseInt(e["im:rating"].label, 10),
      title: e.title?.label ?? null,
      content: e.content.label,
      submitted_at: new Date(e.updated.label).getTime(),
    }));
}
