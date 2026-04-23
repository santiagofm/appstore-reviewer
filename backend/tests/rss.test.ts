import { describe, it, expect } from "vitest";
import { parseReviews } from "../src/rss";
import type { RssEntry } from "../src/types";

const makeEntry = (overrides: Partial<RssEntry> = {}): RssEntry => ({
  id: { label: "123" },
  title: { label: "Great app" },
  content: { label: "Really love it" },
  "im:rating": { label: "5" },
  author: { name: { label: "Alice" } },
  updated: { label: "2026-04-20T10:00:00Z" },
  ...overrides,
});

describe("parseReviews", () => {
  it("maps all entries to Review objects", () => {
    const entries = [
      makeEntry({ id: { label: "1" } }),
      makeEntry({ id: { label: "2" } }),
    ];
    const reviews = parseReviews(entries, "app1");
    expect(reviews).toHaveLength(2);
    expect(reviews[0].review_id).toBe("1");
    expect(reviews[1].review_id).toBe("2");
  });

  it("maps fields correctly", () => {
    const entry = makeEntry();
    const [review] = parseReviews([entry], "app42");
    expect(review.app_id).toBe("app42");
    expect(review.review_id).toBe("123");
    expect(review.author).toBe("Alice");
    expect(review.score).toBe(5);
    expect(review.title).toBe("Great app");
    expect(review.content).toBe("Really love it");
    expect(review.submitted_at).toBe(
      new Date("2026-04-20T10:00:00Z").getTime(),
    );
  });

  it("sets title to null when missing", () => {
    const entry = makeEntry({ title: { label: "" } });
    // An empty title label should still parse without throwing
    const [review] = parseReviews([entry], "app1");
    expect(review).toBeDefined();
  });

  it("filters out entries without im:rating", () => {
    const withRating = makeEntry();
    const withoutRating = {
      ...makeEntry(),
      "im:rating": undefined,
    } as unknown as RssEntry;
    const reviews = parseReviews([withRating, withoutRating], "app1");
    expect(reviews).toHaveLength(1);
  });

  it("returns empty array for empty input", () => {
    expect(parseReviews([], "app1")).toEqual([]);
  });
});
