import { Router } from "express";
import { getApps, deleteApp } from "../db";
import { pollApp } from "../poller";

const router = Router();

router.get("/", (_req, res) => {
  res.json(getApps());
});

router.post("/:appId", async (req, res) => {
  const { appId } = req.params;
  try {
    await pollApp(appId);
    res.json(getApps().find((a) => a.app_id === appId));
  } catch {
    res.status(502).json({
      error: `Could not register app "${appId}". Make sure it's a valid App Store app ID.`,
    });
  }
});

router.delete("/:appId", (req, res) => {
  const { appId } = req.params;
  deleteApp(appId);
  res.json({ ok: true, appId });
});

export default router;
