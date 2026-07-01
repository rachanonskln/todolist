import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { CategoriesApi, TasksApi } from "@/lib/api";
import type { Category, Task, TaskPriority, TaskStatus } from "@/types/task";
import { useLocale } from "@/i18n/LocaleContext";
import { format, parseISO } from "date-fns";

/** Full task list with the status/category/priority/search filters called
 * for in the functional requirements — distinct from the Dashboard, which
 * only ever shows today's tasks and summary counts. */
export function TasksList() {
  const { t } = useLocale();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<TaskStatus | "">("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    CategoriesApi.list()
      .then(setCategories)
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  // Debounce the search box so every keystroke doesn't fire a request.
  const [debouncedQ, setDebouncedQ] = useState(q);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    setLoading(true);
    TasksApi.list({
      status: status || undefined,
      priority: priority || undefined,
      categoryId: categoryId || undefined,
      q: debouncedQ || undefined,
    })
      .then(setTasks)
      .catch((err) => {
        console.error("Failed to load tasks", err);
        setTasks([]);
      })
      .finally(() => setLoading(false));
  }, [status, priority, categoryId, debouncedQ]);

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  return (
    <div className="flex flex-col gap-4">
      <GlassCard>
        <h2 className="mb-4 text-base font-semibold text-slate-700">{t.tasksList.title}</h2>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <input
            className="glass-input col-span-2 md:col-span-1"
            placeholder={t.tasksList.searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="glass-input"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus | "")}
          >
            <option value="">{t.tasksList.allStatuses}</option>
            <option value="pending">{t.status.pending}</option>
            <option value="in_progress">{t.status.in_progress}</option>
            <option value="completed">{t.status.completed}</option>
          </select>
          <select
            className="glass-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority | "")}
          >
            <option value="">{t.tasksList.allPriorities}</option>
            <option value="low">{t.priority.low}</option>
            <option value="medium">{t.priority.medium}</option>
            <option value="high">{t.priority.high}</option>
          </select>
          <select
            className="glass-input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">{t.tasksList.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      <GlassCard>
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 rounded-2xl shimmer" />
            ))}
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <p className="text-sm text-slate-500">{t.tasksList.noResults}</p>
        )}

        <ul className="flex flex-col gap-3">
          {tasks.map((task) => {
            const category = task.categoryId ? categoryById.get(task.categoryId) : undefined;
            return (
              <li
                key={task.id}
                className="flex items-center justify-between rounded-2xl border border-white/40
                  bg-white/40 px-4 py-3 backdrop-blur-glass transition hover:bg-white/60"
              >
                <div>
                  <p className="font-medium text-slate-800">{task.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {format(parseISO(task.startDate), "d MMM yyyy, HH:mm")}
                    </span>
                    {category && (
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-xs text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </li>
            );
          })}
        </ul>
      </GlassCard>
    </div>
  );
}
