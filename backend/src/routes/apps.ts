import { Router } from "express";
import { getApps } from "../db";
import { pollApp } from "../poller";

const router = Router();

router.get("/", (_req, res) => {
  res.json(getApps());
});

router.post("/:appId/poll", async (req, res) => {
  const { appId } = req.params;
  try {
    await pollApp(appId);
    res.json({ ok: true, appId });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
