import { Client, middleware, WebhookEvent, FlexMessage } from "@line/bot-sdk";
import { env } from "../config/env.js";
import type { TaskRecord } from "./notionService.js";

const lineConfig = {
  channelAccessToken: env.line.channelAccessToken,
  channelSecret: env.line.channelSecret,
};

// The LINE SDK client wraps the Messaging API and handles retries/HTTPS for us
// -> this is the only place the raw channel access token is used.
export const lineClient = new Client(lineConfig);

/** Express middleware that verifies the `x-line-signature` header via HMAC. */
export const lineWebhookMiddleware = middleware(lineConfig);

/** Builds a LINE Flex "bubble" reminder card for a single task. */
export function buildTaskReminderFlex(task: TaskRecord): FlexMessage {
  const priorityColor =
    task.priority === "high" ? "#FF6B81" : task.priority === "medium" ? "#FFD37A" : "#7BE0A8";

  return {
    type: "flex",
    altText: `Reminder: ${task.title}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: priorityColor,
        paddingAll: "md",
        contents: [
          { type: "text", text: "⏰ Task Reminder", weight: "bold", color: "#ffffff", size: "sm" },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "lg",
        contents: [
          { type: "text", text: task.title, weight: "bold", size: "md", wrap: true },
          {
            type: "text",
            text: task.description || "No additional details.",
            size: "sm",
            color: "#888888",
            wrap: true,
          },
          {
            type: "box",
            layout: "baseline",
            margin: "md",
            contents: [
              { type: "text", text: "Due", size: "xs", color: "#aaaaaa", flex: 1 },
              {
                type: "text",
                text: new Date(task.startDate).toLocaleString("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
                size: "sm",
                flex: 4,
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            color: priorityColor,
            action: {
              type: "postback",
              label: "Mark as done",
              data: `action=complete&taskId=${task.id}`,
            },
          },
        ],
      },
    },
  };
}

/** Sends a task reminder to the LINE user attached to that task. */
export async function sendTaskReminder(task: TaskRecord) {
  if (!task.lineUserId) return;
  await lineClient.pushMessage(task.lineUserId, buildTaskReminderFlex(task));
}

/**
 * Routes an incoming webhook event. Text messages are forwarded to the AI
 * Processing Module for entity extraction; postbacks (e.g. "Mark as done")
 * are handled directly against Notion by the caller.
 */
export function isTrackableTextMessage(event: WebhookEvent): event is WebhookEvent & {
  type: "message";
  message: { type: "text"; text: string };
} {
  return event.type === "message" && event.message.type === "text";
}

/** Any file the user sends via LINE — a photo, a PDF, a Word doc — gets read
 * and turned into candidate tasks the same way an email attachment does. */
export function isTrackableFileMessage(event: WebhookEvent): event is WebhookEvent & {
  type: "message";
  message: { type: "image" | "file"; id: string };
} {
  return event.type === "message" && (event.message.type === "image" || event.message.type === "file");
}

const EXTENSION_MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

/** LINE only tells us the file name for "file" messages (never a MIME type),
 * so we guess from the extension; "image" messages are always JPEG per the
 * LINE Messaging API's own content delivery format. */
export function guessLineMimeType(messageType: "image" | "file", fileName?: string): string {
  if (messageType === "image") return "image/jpeg";
  const ext = fileName?.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME_TYPES[ext] ?? "application/octet-stream";
}
