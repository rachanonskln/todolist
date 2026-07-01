export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Category {
  id: string;
  name: string;
  color: string; // hex, drives the pastel tag color in the UI
}

// Mirrors the backend's TaskRecord (backend/src/services/notionService.ts)
// exactly — the API returns a flat categoryId, never a nested category
// object, so components that need the name/color must resolve it from a
// separately-fetched category list instead of reading `task.category`.
export interface Task {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  status: TaskStatus;
  priority: TaskPriority;
  categoryId?: string;
  lineUserId?: string;
  assignee?: string;
  needsReview?: boolean;
  reminderMinutesBefore?: number;
}

export type TaskInput = Omit<Task, "id">;
