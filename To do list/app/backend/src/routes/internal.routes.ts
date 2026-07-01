import { Router } from "express";
import { z } from "zod";
import { TasksRepository, LogsRepository } from "../services/notionService.js";
import { sendTaskReminder } from "../services/lineService.js";

/**
 * Machine-to-machine routes, protected by `requireInternalKey` (mounted in
 * index.ts). Callers: the Scheduler Service (reminder sweeps) and the AI
 * Processing Module (writing tasks extracted from email/LINE).
 */
export const internalRouter = Router();

const aiTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  categoryId: z.string().optional(),
  lineUserId: z.string().optional(),
  source: z.enum(["ai_email", "ai_line"]),
});

/** AI Processing Module calls this once it has extracted a structured task. */
internalRouter.post("/ai/tasks", async (req, res, next) => {
  try {
    const input = aiTaskSchema.parse(req.body);
    const task = await TasksRepository.create({
      title: input.title,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      status: "pending",
      priority: input.priority,
      categoryId: input.categoryId,
      lineUserId: input.lineUserId,
    });
    await LogsRepository.record({
      source: input.source,
      message: `AI created task "${task.title}"`,
      relatedTaskId: task.id,
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

/** Scheduler Service calls this every N minutes to fan out due reminders. */
internalRouter.post("/reminders/sweep", async (req, res, next) => {
  try {
    const windowMinutes = Number(req.body?.windowMinutes ?? 30);
    const due = await TasksRepository.findDueForReminder(windowMinutes);

    const results = await Promise.allSettled(due.map(sendTaskReminder));
    const sent = results.filter((r) => r.status === "fulfilled").length;

    await LogsRepository.record({
      source: "reminder",
      message: `Reminder sweep: ${sent}/${due.length} sent (window=${windowMinutes}m)`,
    });

    res.json({ scanned: due.length, sent });
  } catch (err) {
    next(err);
  }
});
