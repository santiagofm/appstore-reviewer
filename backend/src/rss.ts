import type { Review, RssEntry } from "./types";

const RSS_BASE = "https://itunes.apple.com/us/rss/customerreviews";

interface RssFeed {
  feed: {
    entry?: RssEntry[];
  };
}

interface ItunesLookup {
  results: Array<{ trackName: string }>;
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

export async function fetchAppName(appId: string): Promise<string | null> {
  const res = await fetch(`https://itunes.apple.com/lookup?id=${appId}`);
  if (!res.ok) return null;
  const data = (await res.json()) as ItunesLookup;
  return data.results[0]?.trackName ?? null;
}

export function parseReviews(entries: RssEntry[], appId: string): Review[] {
  return entries
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
