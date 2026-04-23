import { Router } from "express";
import { getApps, getReviewsSince } from "../db";
import { pollApp } from "../poller";

const router = Router();

const COOLDOWN_MS = 15 * 60 * 1000;

router.get("/:appId/reviews", async (req, res) => {
  const { appId } = req.params;
  const hours = Math.min(Number(req.query.hours) || 48, 720);

  const app = getApps().find((a) => a.app_id === appId);
  const stale =
    !app ||
    !app.last_polled_at ||
    Date.now() - app.last_polled_at > COOLDOWN_MS;

  if (stale) {
    try {
      await pollApp(appId);
    } catch (err) {
      if (!app) {
        return res.status(502).json({
          error: `Could not fetch reviews for app "${appId}". Make sure it's a valid App Store app ID.`,
        });
      }
      // known app — return stale data rather than failing
    }
  }

  res.json(getReviewsSince(appId, hours));
});

export default router;
