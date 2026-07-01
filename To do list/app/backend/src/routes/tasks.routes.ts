import { Router } from "express";
import { z } from "zod";
import { TasksRepository, LogsRepository, type TaskRecord } from "../services/notionService.js";
import { upsertEventForTask, deleteEventForTask } from "../services/googleCalendarService.js";

export const tasksRouter = Router();

/** Mirrors a task to Google Calendar and persists the returned event id.
 * Skips tasks still pending AI review — an unconfirmed, possibly-wrong
 * AI suggestion shouldn't show up on the user's real calendar until they
 * approve it (see internal.routes.ts). No-ops if Calendar isn't configured. */
async function syncToCalendar(task: TaskRecord): Promise<TaskRecord> {
  if (task.needsReview) return task;
  const eventId = await upsertEventForTask(task);
  if (eventId && eventId !== task.googleEventId) {
    return TasksRepository.update(task.id, { googleEventId: eventId });
  }
  return task;
}

const taskInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(["pending", "in_progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  categoryId: z.string().optional(),
  lineUserId: z.string().optional(),
  assignee: z.string().optional(),
  needsReview: z.boolean().optional(),
  reminderMinutesBefore: z.number().int().min(0).optional(),
});

tasksRouter.get("/", async (req, res, next) => {
  try {
    const { status, categoryId, priority, q } = req.query as {
      status?: string;
      categoryId?: string;
      priority?: string;
      q?: string;
    };
    const tasks = await TasksRepository.list({
      status: status as any,
      categoryId,
      priority: priority as any,
      q,
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// Must come before "/:id" — otherwise Express would treat "assignees" as an id.
tasksRouter.get("/assignees", async (_req, res, next) => {
  try {
    res.json(await TasksRepository.listDistinctAssignees());
  } catch (err) {
    next(err);
  }
});

tasksRouter.get("/:id", async (req, res, next) => {
  try {
    res.json(await TasksRepository.get(req.params.id));
  } catch (err) {
    next(err);
  }
});

tasksRouter.post("/", async (req, res, next) => {
  try {
    const input = taskInputSchema.parse(req.body);
    let task = await TasksRepository.create(input);
    await LogsRepository.record({
      source: "system",
      message: `Task created: ${task.title}`,
      relatedTaskId: task.id,
    });
    task = await syncToCalendar(task);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

tasksRouter.patch("/:id", async (req, res, next) => {
  try {
    const input = taskInputSchema.partial().parse(req.body);
    let task = await TasksRepository.update(req.params.id, input);
    task = await syncToCalendar(task);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

tasksRouter.delete("/:id", async (req, res, next) => {
  try {
    const task = await TasksRepository.get(req.params.id);
    await deleteEventForTask(task.googleEventId);
    await TasksRepository.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
