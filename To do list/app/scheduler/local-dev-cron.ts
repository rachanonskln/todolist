/**
 * Local-dev/self-hosted stand-in for the Cloud Scheduler jobs defined in
 * cloud-scheduler.tf. Run with `npx tsx scheduler/local-dev-cron.ts` when
 * you don't want to stand up Cloud Scheduler (or an EventBridge rule) just
 * to test reminders end-to-end.
 *
 * npm i node-cron
 */
import cron from "node-cron";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";
const AI_MODULE_URL = process.env.AI_MODULE_URL ?? "http://localhost:8000";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "change-me-too";

cron.schedule("*/15 * * * *", async () => {
  const res = await fetch(`${BACKEND_URL}/internal/reminders/sweep`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-internal-key": INTERNAL_API_KEY },
    body: JSON.stringify({ windowMinutes: 30 }),
  });
  console.log("[reminder-sweep]", res.status, await res.text());
});

cron.schedule("*/30 * * * *", async () => {
  const res = await fetch(`${AI_MODULE_URL}/scan/emails`, { method: "POST" });
  console.log("[ai-email-scan]", res.status, await res.text());
});

console.log("Local scheduler running: reminder-sweep every 15m, ai-email-scan every 30m");
