import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { LiveClock } from "@/components/dashboard/LiveClock";
import { ForecastCard, Pm25Card } from "@/components/dashboard/WeatherWidgets";
import { AiReviewCard } from "@/components/dashboard/AiReviewCard";
import { CategoriesApi, TasksApi } from "@/lib/api";
import { DEFAULT_COORDS, fetchWeather, type WeatherData } from "@/lib/weatherApi";
import type { Category, Task } from "@/types/task";
import { isToday, parseISO } from "date-fns";
import { useLocale } from "@/i18n/LocaleContext";

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "pink" | "sky" | "mint" | "lemon";
}) {
  return (
    <GlassCard accent={accent} className="flex flex-col gap-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-3xl font-bold text-slate-800">{value}</span>
    </GlassCard>
  );
}

export function Dashboard() {
  const { t } = useLocale();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const loadWeather = (coords?: { latitude: number; longitude: number }) => {
    setWeatherLoading(true);
    fetchWeather(coords)
      .then(setWeather)
      .catch((err) => {
        console.error("Failed to load weather", err);
        setWeather(null);
      })
      .finally(() => setWeatherLoading(false));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => loadWeather({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      // Permission denied or unavailable — silently keep the default location
      // rather than blocking the widget on a browser permission prompt.
      () => {},
    );
  };

  useEffect(() => {
    TasksApi.list()
      .then(setTasks)
      .catch((err) => {
        console.error("Failed to load tasks", err);
        setTasks([]);
      })
      .finally(() => setLoading(false));
    CategoriesApi.list()
      .then(setCategories)
      .catch((err) => console.error("Failed to load categories", err));
    loadWeather(DEFAULT_COORDS);
  }, []);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // AI-suggested tasks that haven't been confirmed yet don't count as real
  // to-dos — they're pulled out of the stats/list until approved.
  const reviewTasks = useMemo(() => tasks.filter((t) => t.needsReview), [tasks]);
  const confirmedTasks = useMemo(() => tasks.filter((t) => !t.needsReview), [tasks]);

  const stats = useMemo(() => {
    const todayTasks = confirmedTasks.filter((t) => isToday(parseISO(t.startDate)));
    const pending = confirmedTasks.filter((t) => t.status !== "completed");
    const completed = confirmedTasks.filter((t) => t.status === "completed");
    const highPriority = confirmedTasks.filter(
      (t) => t.priority === "high" && t.status !== "completed",
    );
    return { todayTasks, pending, completed, highPriority };
  }, [confirmedTasks]);

  const handleApproveReview = (task: Task) => {
    TasksApi.update(task.id, { needsReview: false })
      .then(() => setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, needsReview: false } : t))))
      .catch((err) => console.error("Failed to approve suggested task", err));
  };

  const handleRejectReview = (task: Task) => {
    TasksApi.remove(task.id)
      .then(() => setTasks((prev) => prev.filter((t) => t.id !== task.id)))
      .catch((err) => console.error("Failed to reject suggested task", err));
  };

  return (
    <div className="flex flex-col gap-6">
      <AiReviewCard tasks={reviewTasks} onApprove={handleApproveReview} onReject={handleRejectReview} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryStat label={t.dashboard.today} value={stats.todayTasks.length} accent="sky" />
        <SummaryStat label={t.dashboard.pending} value={stats.pending.length} accent="lemon" />
        <SummaryStat label={t.dashboard.completed} value={stats.completed.length} accent="mint" />
        <SummaryStat
          label={t.dashboard.highPriority}
          value={stats.highPriority.length}
          accent="pink"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LiveClock />
        <Pm25Card weather={weather} loading={weatherLoading} />
      </div>

      <ForecastCard weather={weather} loading={weatherLoading} onUseMyLocation={handleUseMyLocation} />

      <GlassCard>
        <h2 className="mb-4 text-base font-semibold text-slate-700">{t.dashboard.todaysTasks}</h2>

        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-2xl shimmer" />
            ))}
          </div>
        )}

        {!loading && stats.todayTasks.length === 0 && (
          <p className="text-sm text-slate-500">{t.dashboard.noTasksToday}</p>
        )}

        <ul className="flex flex-col gap-3">
          {stats.todayTasks.map((task) => {
            const category = task.categoryId ? categoryById.get(task.categoryId) : undefined;
            return (
              <li
                key={task.id}
                className="flex items-center justify-between rounded-2xl border border-white/40
                  bg-white/40 px-4 py-3 backdrop-blur-glass transition hover:bg-white/60"
              >
                <div>
                  <p className="font-medium text-slate-800">{task.title}</p>
                  {category && (
                    <span
                      className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name}
                    </span>
                  )}
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
