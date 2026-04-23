import Database from "better-sqlite3";
import path from "path";
import type { App, Review } from "./types";

const DB_PATH = path.join(__dirname, "../data.db");

let _db: Database.Database | null = null;

export function getDb(dbPath = DB_PATH): Database.Database {
  if (_db) return _db;
  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");
  _db.exec(`
    CREATE TABLE IF NOT EXISTS apps (
      app_id         TEXT PRIMARY KEY,
      name           TEXT,
      first_seen_at  INTEGER NOT NULL,
      last_polled_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS reviews (
      app_id        TEXT NOT NULL REFERENCES apps(app_id),
      review_id     TEXT NOT NULL,
      author        TEXT NOT NULL,
      score         INTEGER NOT NULL,
      title         TEXT,
      content       TEXT NOT NULL,
      submitted_at  INTEGER NOT NULL,
      PRIMARY KEY (app_id, review_id)
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_app_submitted
      ON reviews(app_id, submitted_at DESC);
  `);
  return _db;
}

export function insertOrIgnoreApp(appId: string): void {
  const db = getDb();
  db.prepare(
    `
    INSERT OR IGNORE INTO apps (app_id, first_seen_at)
    VALUES (?, ?)
  `,
  ).run(appId, Date.now());
}

export function updateAppName(appId: string, name: string): void {
  const db = getDb();
  db.prepare(`UPDATE apps SET name = ? WHERE app_id = ? AND name IS NULL`).run(
    name,
    appId,
  );
}

export function updateLastPolled(appId: string): void {
  const db = getDb();
  db.prepare(`UPDATE apps SET last_polled_at = ? WHERE app_id = ?`).run(
    Date.now(),
    appId,
  );
}

export function upsertReview(review: Review): void {
  const db = getDb();
  db.prepare(
    `
    INSERT OR IGNORE INTO reviews
      (app_id, review_id, author, score, title, content, submitted_at)
    VALUES
      (@app_id, @review_id, @author, @score, @title, @content, @submitted_at)
  `,
  ).run(review);
}

export function getApps(): App[] {
  return getDb()
    .prepare(`SELECT * FROM apps ORDER BY first_seen_at DESC`)
    .all() as App[];
}

export function getReviewsSince(appId: string, hours: number): Review[] {
  const since = Date.now() - hours * 60 * 60 * 1000;
  return getDb()
    .prepare(
      `
      SELECT * FROM reviews
      WHERE app_id = ? AND submitted_at >= ?
      ORDER BY submitted_at DESC
    `,
    )
    .all(appId, since) as Review[];
}

export function getLastPolled(appId: string): number | null {
  const row = getDb()
    .prepare(`SELECT last_polled_at FROM apps WHERE app_id = ?`)
    .get(appId) as { last_polled_at: number | null } | undefined;
  return row?.last_polled_at ?? null;
}
