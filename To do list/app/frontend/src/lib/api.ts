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

// If there's no backend behind `apiBaseUrl` yet, a request to an unmapped
// path can still resolve with HTTP 200 (e.g. a static host's SPA fallback
// serving index.html instead of a 404/JSON). Without this check, that HTML
// string would flow straight into `.filter()`-ing UI code and crash with a
// cryptic "t.filter is not a function" instead of a catchable rejection.
function assertArray<T>(data: unknown, context: string): T[] {
  if (!Array.isArray(data)) {
    throw new Error(`Expected an array from ${context}, got: ${typeof data}`);
  }
  return data as T[];
}

export const TasksApi = {
  list: (params?: { status?: string; categoryId?: string; q?: string }) =>
    api.get<Task[]>("/tasks", { params }).then((r) => assertArray<Task>(r.data, "GET /tasks")),
  get: (id: string) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),
  create: (input: TaskInput) =>
    api.post<Task>("/tasks", input).then((r) => r.data),
  update: (id: string, input: Partial<TaskInput>) =>
    api.patch<Task>(`/tasks/${id}`, input).then((r) => r.data),
  remove: (id: string) => api.delete(`/tasks/${id}`),
};

export const CategoriesApi = {
  list: () =>
    api.get<Category[]>("/categories").then((r) => assertArray<Category>(r.data, "GET /categories")),
  create: (input: Omit<Category, "id">) =>
    api.post<Category>("/categories", input).then((r) => r.data),
};
