import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";
import { env } from "../config/env.js";

export const notion = new Client({ auth: env.notion.apiKey });

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskRecord {
  id: string; // Notion page id
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  categoryId?: string;
  lineUserId?: string;
  assignee?: string;
  /** True for tasks the AI module created from an email/LINE message that
   * haven't been confirmed by the user yet — see internal.routes.ts. */
  needsReview: boolean;
  /** Archived tasks stay in the database but are hidden from the default
   * views — the user's "done and past, keep don't delete" bucket. */
  archived: boolean;
  reminderMinutesBefore: number;
  /** Id of the mirrored Google Calendar event, if Calendar sync is
   * configured — lets updates/deletes target the right event instead of
   * creating duplicates. */
  googleEventId?: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  categoryId?: string;
  lineUserId?: string;
  assignee?: string;
  needsReview?: boolean;
  archived?: boolean;
  reminderMinutesBefore?: number;
  googleEventId?: string;
}

/** Maps a raw Notion page into the flat shape the rest of the app uses. */
function mapPageToTask(page: PageObjectResponse): TaskRecord {
  const p = page.properties as any;
  return {
    id: page.id,
    title: p.Title?.title?.[0]?.plain_text ?? "",
    description: p.Description?.rich_text?.[0]?.plain_text ?? "",
    startDate: p.Date?.date?.start ?? "",
    endDate: p.Date?.date?.end ?? p.Date?.date?.start ?? "",
    status: (p.Status?.select?.name ?? "pending") as TaskStatus,
    priority: (p.Priority?.select?.name ?? "medium") as TaskPriority,
    categoryId: p.Category?.relation?.[0]?.id,
    lineUserId: p.LineUserId?.rich_text?.[0]?.plain_text || undefined,
    assignee: p.Assignee?.rich_text?.[0]?.plain_text || undefined,
    needsReview: p.NeedsReview?.checkbox ?? false,
    archived: p.Archived?.checkbox ?? false,
    reminderMinutesBefore: p.ReminderMinutesBefore?.number ?? 30,
    googleEventId: p.GoogleEventId?.rich_text?.[0]?.plain_text || undefined,
  };
}

function taskToProperties(input: Partial<TaskInput>) {
  const props: Record<string, unknown> = {};
  if (input.title !== undefined) {
    props.Title = { title: [{ text: { content: input.title } }] };
  }
  if (input.description !== undefined) {
    props.Description = { rich_text: [{ text: { content: input.description } }] };
  }
  if (input.startDate !== undefined) {
    props.Date = { date: { start: input.startDate, end: input.endDate ?? null } };
  }
  if (input.status !== undefined) {
    props.Status = { select: { name: input.status } };
  }
  if (input.priority !== undefined) {
    props.Priority = { select: { name: input.priority } };
  }
  if (input.categoryId !== undefined) {
    props.Category = { relation: [{ id: input.categoryId }] };
  }
  if (input.lineUserId !== undefined) {
    props.LineUserId = { rich_text: [{ text: { content: input.lineUserId } }] };
  }
  if (input.assignee !== undefined) {
    props.Assignee = { rich_text: [{ text: { content: input.assignee } }] };
  }
  if (input.needsReview !== undefined) {
    props.NeedsReview = { checkbox: input.needsReview };
  }
  if (input.archived !== undefined) {
    props.Archived = { checkbox: input.archived };
  }
  if (input.reminderMinutesBefore !== undefined) {
    props.ReminderMinutesBefore = { number: input.reminderMinutesBefore };
  }
  if (input.googleEventId !== undefined) {
    props.GoogleEventId = { rich_text: [{ text: { content: input.googleEventId } }] };
  }
  return props;
}

export const TasksRepository = {
  async list(filter?: {
    status?: TaskStatus;
    categoryId?: string;
    priority?: TaskPriority;
    q?: string;
    archived?: boolean;
  }) {
    const andFilters: any[] = [];
    // Default views hide archived tasks; pass archived:true to list only the
    // archived bucket instead.
    andFilters.push({ property: "Archived", checkbox: { equals: filter?.archived ?? false } });
    if (filter?.status) {
      andFilters.push({ property: "Status", select: { equals: filter.status } });
    }
    if (filter?.categoryId) {
      andFilters.push({ property: "Category", relation: { contains: filter.categoryId } });
    }
    if (filter?.priority) {
      andFilters.push({ property: "Priority", select: { equals: filter.priority } });
    }
    if (filter?.q) {
      // Notion has no cross-property full-text search via the API — match
      // against the Title property only (the field users actually scan).
      andFilters.push({ property: "Title", title: { contains: filter.q } });
    }

    const response = await notion.databases.query({
      database_id: env.notion.tasksDbId,
      filter: andFilters.length ? { and: andFilters } : undefined,
      sorts: [{ property: "Date", direction: "ascending" }],
    });

    return (response.results as PageObjectResponse[]).map(mapPageToTask);
  },

  async get(pageId: string) {
    const page = (await notion.pages.retrieve({ page_id: pageId })) as PageObjectResponse;
    return mapPageToTask(page);
  },

  /** Distinct assignee names already used, most-recent first — powers the
   * autocomplete "remember what I typed before" behavior in the task form. */
  async listDistinctAssignees(): Promise<string[]> {
    const response = await notion.databases.query({
      database_id: env.notion.tasksDbId,
      filter: { property: "Assignee", rich_text: { is_not_empty: true } },
      sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    });
    const seen = new Set<string>();
    for (const page of response.results as PageObjectResponse[]) {
      const name = (page.properties as any).Assignee?.rich_text?.[0]?.plain_text;
      if (name) seen.add(name);
    }
    return [...seen];
  },

  async create(input: TaskInput) {
    const page = (await notion.pages.create({
      parent: { database_id: env.notion.tasksDbId },
      properties: taskToProperties(input) as any,
    })) as PageObjectResponse;
    return mapPageToTask(page);
  },

  async update(pageId: string, input: Partial<TaskInput>) {
    const page = (await notion.pages.update({
      page_id: pageId,
      properties: taskToProperties(input) as any,
    })) as PageObjectResponse;
    return mapPageToTask(page);
  },

  /** Notion has no hard delete via API for pages in a DB — archive instead. */
  async remove(pageId: string) {
    await notion.pages.update({ page_id: pageId, archived: true });
  },

  /** Used by the Scheduler Service to find tasks that need a LINE reminder. */
  async findDueForReminder(withinMinutes: number) {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + withinMinutes * 60_000);

    const response = await notion.databases.query({
      database_id: env.notion.tasksDbId,
      filter: {
        and: [
          { property: "Status", select: { does_not_equal: "completed" } },
          { property: "Date", date: { on_or_after: now.toISOString() } },
          { property: "Date", date: { on_or_before: windowEnd.toISOString() } },
        ],
      },
    });

    return (response.results as PageObjectResponse[]).map(mapPageToTask);
  },
};

export const CategoriesRepository = {
  async list() {
    const response = await notion.databases.query({
      database_id: env.notion.categoriesDbId,
    });
    return (response.results as PageObjectResponse[]).map((page) => {
      const p = page.properties as any;
      return {
        id: page.id,
        name: p.Name?.title?.[0]?.plain_text ?? "",
        color: p.Color?.rich_text?.[0]?.plain_text ?? "#cdeeff",
      };
    });
  },

  async create(input: { name: string; color: string }) {
    const page = (await notion.pages.create({
      parent: { database_id: env.notion.categoriesDbId },
      properties: {
        Name: { title: [{ text: { content: input.name } }] },
        Color: { rich_text: [{ text: { content: input.color } }] },
      },
    })) as PageObjectResponse;
    const p = page.properties as any;
    return {
      id: page.id,
      name: p.Name.title[0].plain_text,
      color: p.Color.rich_text[0].plain_text,
    };
  },
};

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  avatarUrl?: string;
  lineUserId?: string;
  notionApiKey?: string;
  lineChannelAccessToken?: string;
  emailIntegrationStatus: "connected" | "disconnected";
}

// Notion caps each rich_text run at 2000 characters, so a data-URL avatar
// (easily 10-20k chars) has to be split across multiple runs on write and
// rejoined on read.
const RICH_TEXT_CHUNK_SIZE = 1900;

function chunkRichText(value: string) {
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += RICH_TEXT_CHUNK_SIZE) {
    chunks.push(value.slice(i, i + RICH_TEXT_CHUNK_SIZE));
  }
  return chunks.map((chunk) => ({ text: { content: chunk } }));
}

function joinRichText(richText: { plain_text: string }[] | undefined): string | undefined {
  const joined = richText?.map((r) => r.plain_text).join("");
  return joined || undefined;
}

/**
 * User accounts + per-user integration config. In production this table
 * benefits from a proper index (Notion queries are O(n) scans), so consider
 * mirroring `email` into a cache/KV lookup once the user base grows.
 */
function mapPageToUser(page: PageObjectResponse): UserRecord {
  const p = page.properties as any;
  return {
    id: page.id,
    email: p.Email?.email ?? "",
    passwordHash: p.PasswordHash?.rich_text?.[0]?.plain_text ?? "",
    name: joinRichText(p.Name?.title),
    avatarUrl: joinRichText(p.AvatarUrl?.rich_text),
    lineUserId: p.LineUserId?.rich_text?.[0]?.plain_text || undefined,
    notionApiKey: p.NotionApiKey?.rich_text?.[0]?.plain_text || undefined,
    lineChannelAccessToken: p.LineChannelAccessToken?.rich_text?.[0]?.plain_text || undefined,
    emailIntegrationStatus: (p.EmailIntegrationStatus?.select?.name ??
      "disconnected") as "connected" | "disconnected",
  };
}

export const UsersRepository = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const response = await notion.databases.query({
      database_id: env.notion.usersDbId,
      filter: { property: "Email", email: { equals: email } },
    });
    const page = response.results[0] as PageObjectResponse | undefined;
    return page ? mapPageToUser(page) : null;
  },

  async getById(userId: string): Promise<UserRecord> {
    const page = (await notion.pages.retrieve({ page_id: userId })) as PageObjectResponse;
    return mapPageToUser(page);
  },

  async updateProfile(userId: string, input: { name?: string; avatarUrl?: string }) {
    const props: Record<string, unknown> = {};
    if (input.name !== undefined) {
      props.Name = { title: [{ text: { content: input.name } }] };
    }
    if (input.avatarUrl !== undefined) {
      props.AvatarUrl = { rich_text: chunkRichText(input.avatarUrl) };
    }
    const page = (await notion.pages.update({
      page_id: userId,
      properties: props as any,
    })) as PageObjectResponse;
    return mapPageToUser(page);
  },
};

/** Append-only audit trail for AI actions and notification sends. */
export const LogsRepository = {
  async record(entry: {
    source: "ai_email" | "ai_line" | "reminder" | "system";
    message: string;
    relatedTaskId?: string;
  }) {
    await notion.pages.create({
      parent: { database_id: env.notion.logsDbId },
      properties: {
        Name: { title: [{ text: { content: entry.message.slice(0, 100) } }] },
        Source: { select: { name: entry.source } },
        Message: { rich_text: [{ text: { content: entry.message } }] },
        RelatedTask: entry.relatedTaskId
          ? { relation: [{ id: entry.relatedTaskId }] }
          : { relation: [] },
        Timestamp: { date: { start: new Date().toISOString() } },
      },
    });
  },
};
