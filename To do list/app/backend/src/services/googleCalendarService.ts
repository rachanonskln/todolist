import { google } from "googleapis";
import { env } from "../config/env.js";
import type { TaskRecord } from "./notionService.js";

export function isCalendarConfigured(): boolean {
  return Boolean(env.google.clientId && env.google.clientSecret && env.google.refreshToken);
}

function getCalendarClient() {
  const auth = new google.auth.OAuth2(env.google.clientId, env.google.clientSecret);
  auth.setCredentials({ refresh_token: env.google.refreshToken });
  return google.calendar({ version: "v3", auth });
}

function toEventBody(task: TaskRecord) {
  return {
    summary: task.title,
    description: task.description || undefined,
    start: { dateTime: task.startDate },
    end: { dateTime: task.endDate },
  };
}

/**
 * Creates or updates the Google Calendar event mirroring this task. Returns
 * the event id to persist back onto the Notion record (GoogleEventId), or
 * undefined if Calendar sync isn't configured or the call failed — callers
 * treat Calendar as a best-effort mirror, never a blocker on the primary
 * Notion write.
 */
export async function upsertEventForTask(task: TaskRecord): Promise<string | undefined> {
  if (!isCalendarConfigured()) return undefined;

  try {
    const calendar = getCalendarClient();
    if (task.googleEventId) {
      const res = await calendar.events.update({
        calendarId: env.google.calendarId,
        eventId: task.googleEventId,
        requestBody: toEventBody(task),
      });
      return res.data.id ?? task.googleEventId;
    }
    const res = await calendar.events.insert({
      calendarId: env.google.calendarId,
      requestBody: toEventBody(task),
    });
    return res.data.id ?? undefined;
  } catch (err) {
    console.error("Failed to sync task to Google Calendar", err);
    return undefined;
  }
}

export async function deleteEventForTask(googleEventId: string | undefined): Promise<void> {
  if (!isCalendarConfigured() || !googleEventId) return;

  try {
    const calendar = getCalendarClient();
    await calendar.events.delete({ calendarId: env.google.calendarId, eventId: googleEventId });
  } catch (err) {
    console.error("Failed to delete Google Calendar event", err);
  }
}
