import { describe, it, expect, beforeEach, vi } from "vitest";
import { resetDb, getDb, getReviewsSince, insertOrIgnoreApp } from "../src/db";
import { pollApp } from "../src/poller";
import type { RssEntry } from "../src/types";

// Prevent real network calls
vi.mock("../src/rss", () => ({
  fetchAppName: vi.fn().mockResolvedValue("Test App"),
  fetchRssPage: vi.fn(),
  parseReviews: vi.fn(),
}));

import { fetchRssPage, parseReviews } from "../src/rss";

const now = Date.now();
const withinWindow = now - 10 * 60 * 60 * 1000; // 10h ago
const outsideWindow = now - 72 * 60 * 60 * 1000; // 72h ago

const makeReview = (id: string, submittedAt = withinWindow) => ({
  app_id: "app1",
  review_id: id,
  author: "Tester",
  score: 4,
  title: "Good",
  content: "Works well",
  submitted_at: submittedAt,
});

const makeEntry = (id: string): RssEntry => ({
  id: { label: id },
  title: { label: "Good" },
  content: { label: "Works well" },
  "im:rating": { label: "4" },
  author: { name: { label: "Tester" } },
  updated: { label: new Date(withinWindow).toISOString() },
});

beforeEach(() => {
  resetDb();
  getDb(":memory:");
  vi.mocked(fetchRssPage).mockReset();
  vi.mocked(parseReviews).mockReset();
});

describe("pollApp — deduplication", () => {
  it("polling the same reviews twice stores no duplicates", async () => {
    const entries = [makeEntry("r1"), makeEntry("r2")];
    vi.mocked(fetchRssPage)
      .mockResolvedValueOnce(entries)
      .mockResolvedValue([]);
    vi.mocked(parseReviews)
      .mockReturnValueOnce([makeReview("r1"), makeReview("r2")])
      .mockReturnValue([]);

    await pollApp("app1");

    // Second poll — same reviews
    vi.mocked(fetchRssPage)
      .mockResolvedValueOnce(entries)
      .mockResolvedValue([]);
    vi.mocked(parseReviews)
      .mockReturnValueOnce([makeReview("r1"), makeReview("r2")])
      .mockReturnValue([]);

    await pollApp("app1");

    const db = getDb();
    const count = (
      db
        .prepare("SELECT COUNT(*) as c FROM reviews WHERE app_id = ?")
        .get("app1") as { c: number }
    ).c;
    expect(count).toBe(2);
  });
});

describe("getReviewsSince — ordering and window", () => {
  beforeEach(() => {
    insertOrIgnoreApp("app1");
    const db = getDb();
    db.prepare(
      `INSERT INTO reviews (app_id, review_id, author, score, title, content, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run("app1", "old", "A", 5, "Old", "Old review", outsideWindow);
    db.prepare(
      `INSERT INTO reviews (app_id, review_id, author, score, title, content, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run("app1", "new", "B", 4, "New", "New review", withinWindow);
  });

  it("excludes reviews older than the time window", () => {
    const reviews = getReviewsSince("app1", 48);
    expect(
      reviews.every((r) => r.submitted_at >= now - 48 * 60 * 60 * 1000),
    ).toBe(true);
    expect(reviews.find((r) => r.review_id === "old")).toBeUndefined();
  });

  it("returns reviews newest first", () => {
    // Insert a second in-window review older than 'new'
    const db = getDb();
    db.prepare(
      `INSERT INTO reviews (app_id, review_id, author, score, title, content, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run("app1", "mid", "C", 3, "Mid", "Mid review", withinWindow - 60_000);

    const reviews = getReviewsSince("app1", 48);
    expect(reviews[0].review_id).toBe("new");
    expect(reviews[1].review_id).toBe("mid");
  });
});
