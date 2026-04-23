import express from "express";
import cors from "cors";
import { getDb } from "./db";
import { startScheduler } from "./scheduler";
import appsRouter from "./routes/apps";
import reviewsRouter from "./routes/reviews";
import searchRouter from "./routes/search";

const app = express();
const PORT = 3001;

getDb();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  try {
    getDb().prepare("SELECT 1").run();
    res.json({ ok: true, db: "ok" });
  } catch (err) {
    res.status(503).json({ ok: false, db: "error", detail: String(err) });
  }
});

app.use("/api/apps", appsRouter);
app.use("/api/apps", reviewsRouter);
app.use("/api/search", searchRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startScheduler();
});
