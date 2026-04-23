import { Router } from "express";
import { getApps, getReviewsSince } from "../db";
import { pollApp } from "../poller";

const router = Router();

router.get("/:appId/reviews", async (req, res) => {
  const { appId } = req.params;
  const hours = Math.min(Number(req.query.hours) || 48, 720); // cap at 30 days

  const known = getApps().some((a) => a.app_id === appId);
  if (!known) {
    try {
      await pollApp(appId);
    } catch (err) {
      return res.status(502).json({
        error: `Could not fetch reviews for app "${appId}". Make sure it's a valid App Store app ID.`,
      });
    }
  }

  res.json(getReviewsSince(appId, hours));
});

export default router;
