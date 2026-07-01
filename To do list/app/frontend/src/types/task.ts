export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Category {
  id: string;
  name: string;
  color: string; // hex, drives the pastel tag color in the UI
}

export interface Task {
  id: string;
  notionPageId?: string;
  title: string;
  description?: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  status: TaskStatus;
  priority: TaskPriority;
  category?: Category;
  lineUserId?: string;
  reminderMinutesBefore?: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskInput = Omit<
  Task,
  "id" | "notionPageId" | "createdAt" | "updatedAt" | "category"
> & { categoryId?: string };
