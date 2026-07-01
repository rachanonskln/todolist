import axios from "axios";
import type { Category, Task, TaskInput } from "@/types/task";

// Local dev: Vite proxies "/api" to the backend (see vite.config.ts), so the
// relative path is enough. Once the frontend is static-hosted on Cloudflare
// Pages, it's no longer same-origin with the backend — set VITE_API_BASE_URL
// (e.g. your Cloud Run URL + "/api") as a Pages build environment variable.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const api = axios.create({ baseURL: apiBaseUrl });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const TasksApi = {
  list: (params?: { status?: string; categoryId?: string; q?: string }) =>
    api.get<Task[]>("/tasks", { params }).then((r) => r.data),
  get: (id: string) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),
  create: (input: TaskInput) =>
    api.post<Task>("/tasks", input).then((r) => r.data),
  update: (id: string, input: Partial<TaskInput>) =>
    api.patch<Task>(`/tasks/${id}`, input).then((r) => r.data),
  remove: (id: string) => api.delete(`/tasks/${id}`),
};

export const CategoriesApi = {
  list: () => api.get<Category[]>("/categories").then((r) => r.data),
  create: (input: Omit<Category, "id">) =>
    api.post<Category>("/categories", input).then((r) => r.data),
};
