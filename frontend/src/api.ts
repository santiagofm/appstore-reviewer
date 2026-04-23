export interface AppResult {
  appId: string;
  name: string;
  seller: string;
  icon: string;
}

export interface TrackedApp {
  app_id: string;
  name: string | null;
  first_seen_at: number;
  last_polled_at: number | null;
}

export interface Review {
  app_id: string;
  review_id: string;
  author: string;
  score: number;
  title: string | null;
  content: string;
  submitted_at: number;
}

export async function searchApps(term: string): Promise<AppResult[]> {
  const res = await fetch(`/api/search?term=${encodeURIComponent(term)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function getTrackedApps(): Promise<TrackedApp[]> {
  const res = await fetch("/api/apps");
  if (!res.ok) throw new Error("Failed to load tracked apps");
  return res.json();
}

export async function getReviews(appId: string, hours = 48): Promise<Review[]> {
  const res = await fetch(`/api/apps/${appId}/reviews?hours=${hours}`);
  if (!res.ok) throw new Error("Failed to load reviews");
  return res.json();
}

export async function removeApp(appId: string): Promise<void> {
  const res = await fetch(`/api/apps/${appId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove app");
}
