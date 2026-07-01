import { Router } from "express";
import type { WebhookEvent } from "@line/bot-sdk";
import { lineWebhookMiddleware, isTrackableTextMessage } from "../services/lineService.js";
import { TasksRepository, LogsRepository } from "../services/notionService.js";
import { env } from "../config/env.js";

export const lineRouter = Router();

/**
 * LINE webhook entrypoint. `lineWebhookMiddleware` verifies the HMAC
 * signature and parses the body before this handler ever runs, so anything
 * that reaches here is a genuine event from LINE's platform.
 */
lineRouter.post("/webhook", lineWebhookMiddleware, async (req, res) => {
  const events: WebhookEvent[] = req.body.events;

  // Ack immediately; LINE retries webhooks that don't get a fast 200.
  res.status(200).end();

  for (const event of events) {
    try {
      if (event.type === "postback" && event.postback.data.startsWith("action=complete")) {
        const params = new URLSearchParams(event.postback.data);
        const taskId = params.get("taskId");
        if (taskId) {
          await TasksRepository.update(taskId, { status: "completed" });
          await LogsRepository.record({
            source: "reminder",
            message: `Task marked complete via LINE postback`,
            relatedTaskId: taskId,
          });
        }
        continue;
      }

      if (isTrackableTextMessage(event)) {
        // Hand the raw message off to the AI Processing Module for entity
        // extraction. The AI module authenticates back to /internal/tasks
        // with INTERNAL_API_KEY once it has structured data to save.
        await fetch(`${env.aiModuleUrl}/analyze/line-message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lineUserId: event.source.userId,
            text: event.message.text,
            timestamp: event.timestamp,
          }),
        });
      }
    } catch (err) {
      console.error("Failed to process LINE event", err);
    }
  }
});
