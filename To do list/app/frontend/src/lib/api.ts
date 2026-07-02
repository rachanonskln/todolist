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

// A 401 means the token is missing/expired — clear it and bounce to /login
// rather than leaving the UI stuck showing stale or empty authenticated data.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

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

export const AuthApi = {
  login: (email: string, password: string) =>
    api
      .post<{ token: string; user: { id: string; email: string } }>("/auth/login", {
        email,
        password,
      })
      .then((r) => r.data),
};

export const TasksApi = {
  list: (params?: {
    status?: string;
    categoryId?: string;
    priority?: string;
    q?: string;
    archived?: boolean;
  }) => api.get<Task[]>("/tasks", { params }).then((r) => assertArray<Task>(r.data, "GET /tasks")),
  get: (id: string) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),
  create: (input: TaskInput) =>
    api.post<Task>("/tasks", input).then((r) => r.data),
  update: (id: string, input: Partial<TaskInput>) =>
    api.patch<Task>(`/tasks/${id}`, input).then((r) => r.data),
  remove: (id: string) => api.delete(`/tasks/${id}`),
  listAssignees: () =>
    api
      .get<string[]>("/tasks/assignees")
      .then((r) => assertArray<string>(r.data, "GET /tasks/assignees")),
};

export interface Profile {
  email: string;
  name?: string;
  avatarUrl?: string;
}

export const ProfileApi = {
  get: () => api.get<Profile>("/profile").then((r) => r.data),
  update: (input: Partial<Pick<Profile, "name" | "avatarUrl">>) =>
    api.patch<Profile>("/profile", input).then((r) => r.data),
};

export const CategoriesApi = {
  list: () =>
    api.get<Category[]>("/categories").then((r) => assertArray<Category>(r.data, "GET /categories")),
  create: (input: Omit<Category, "id">) =>
    api.post<Category>("/categories", input).then((r) => r.data),
};
