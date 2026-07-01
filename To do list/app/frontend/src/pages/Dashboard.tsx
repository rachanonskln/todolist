import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { TasksApi } from "@/lib/api";
import type { Task } from "@/types/task";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    TasksApi.list()
      .then(setTasks)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const todayTasks = tasks.filter((t) => isToday(parseISO(t.startDate)));
    const pending = tasks.filter((t) => t.status !== "completed");
    const completed = tasks.filter((t) => t.status === "completed");
    const highPriority = tasks.filter(
      (t) => t.priority === "high" && t.status !== "completed",
    );
    return { todayTasks, pending, completed, highPriority };
  }, [tasks]);

  return (
    <div className="flex flex-col gap-6">
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
          {stats.todayTasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between rounded-2xl border border-white/40
                bg-white/40 px-4 py-3 backdrop-blur-glass transition hover:bg-white/60"
            >
              <div>
                <p className="font-medium text-slate-800">{task.title}</p>
                {task.category && (
                  <span
                    className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs text-white"
                    style={{ backgroundColor: task.category.color }}
                  >
                    {task.category.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
