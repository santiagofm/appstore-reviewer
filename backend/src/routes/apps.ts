import { Router } from "express";
import { getApps, deleteApp } from "../db";

const router = Router();

router.get("/", (_req, res) => {
  res.json(getApps());
});

router.delete("/:appId", (req, res) => {
  const { appId } = req.params;
  deleteApp(appId);
  res.json({ ok: true, appId });
});

export default router;
