export interface App {
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
  submitted_at: number; // unix ms
}

// Shape of a single entry from Apple's RSS JSON feed
export interface RssEntry {
  id: { label: string };
  title: { label: string };
  content: { label: string };
  "im:rating": { label: string };
  author: { name: { label: string } };
  updated: { label: string };
  // present only on first entry of page 1 (app metadata)
  "im:name"?: { label: string };
}
