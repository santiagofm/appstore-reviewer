import cron from "node-cron";
import { pollAllTrackedApps } from "./poller";

export function startScheduler(): void {
  // Run immediately on startup so data is available after a restart
  pollAllTrackedApps().catch((err) =>
    console.error("[scheduler] Initial poll failed:", err),
  );

  // Then poll all tracked apps every 15 minutes
  cron.schedule("*/15 * * * *", () => {
    pollAllTrackedApps().catch((err) =>
      console.error("[scheduler] Scheduled poll failed:", err),
    );
  });

  console.log("[scheduler] Started — polling every 15 minutes");
}
