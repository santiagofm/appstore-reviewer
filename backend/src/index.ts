import express from "express";
import { getDb } from "./db.js";

const app = express();
const PORT = 3001;

// Initialize DB + schema on startup
getDb();

app.use(express.json());

app.get("/health", (_req, res) => {
  try {
    getDb().prepare("SELECT 1").run();
    res.json({ ok: true, db: "ok" });
  } catch (err) {
    res.status(503).json({ ok: false, db: "error", detail: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
