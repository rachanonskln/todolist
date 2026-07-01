import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { differenceInHours, parseISO } from "date-fns";
import { TasksApi } from "@/lib/api";
import { useLocale } from "@/i18n/LocaleContext";
import type { Task } from "@/types/task";

const DISMISSED_KEY = "dismissedNotificationIds";

interface NotificationItem {
  id: string;
  kind: "review" | "dueSoon";
  title: string;
}

function loadDismissed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function NotificationBell() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    TasksApi.list()
      .then(setTasks)
      .catch((err) => console.error("Failed to load tasks for notifications", err));
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const items = useMemo<NotificationItem[]>(() => {
    const reviewItems = tasks
      .filter((task) => task.needsReview)
      .map((task) => ({ id: `review-${task.id}`, kind: "review" as const, title: task.title }));

    const dueSoonItems = tasks
      .filter((task) => {
        if (task.needsReview || task.status === "completed") return false;
        const hoursUntil = differenceInHours(parseISO(task.startDate), new Date());
        return hoursUntil >= -24 && hoursUntil <= 24;
      })
      .map((task) => ({ id: `due-${task.id}`, kind: "dueSoon" as const, title: task.title }));

    return [...reviewItems, ...dueSoonItems];
  }, [tasks]);

  const visible = items.filter((item) => !dismissed.has(item.id));

  const persistDismissed = (next: Set<string>) => {
    setDismissed(next);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
  };

  const dismissOne = (id: string) => persistDismissed(new Set([...dismissed, id]));
  const clearAll = () => persistDismissed(new Set([...dismissed, ...visible.map((v) => v.id)]));

  const goTo = (item: NotificationItem) => {
    navigate(item.kind === "review" ? "/" : "/tasks");
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="glass-button relative !px-3 !py-2 text-lg"
        aria-label={t.notifications.title}
        onClick={() => setOpen((v) => !v)}
      >
        🔔
        {visible.length > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center
              rounded-full bg-rose-400 px-1 text-[10px] font-semibold text-white"
          >
            {visible.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="glass-panel absolute right-0 top-12 z-20 w-80 max-w-[90vw] !bg-white/95
            p-3 shadow-xl backdrop-blur-xl"
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">{t.notifications.title}</h3>
            {visible.length > 0 && (
              <button
                className="text-xs font-medium text-slate-500 underline hover:text-slate-700"
                onClick={clearAll}
              >
                {t.notifications.clearAll}
              </button>
            )}
          </div>

          {visible.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-500">{t.notifications.empty}</p>
          )}

          <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {visible.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-2 rounded-xl bg-white/50 p-2.5 text-sm"
              >
                <button className="flex-1 text-left" onClick={() => goTo(item)}>
                  <span className="mr-1">{item.kind === "review" ? "🤖" : "⏰"}</span>
                  <span className="text-xs text-slate-500">
                    {item.kind === "review" ? t.notifications.reviewLabel : t.notifications.dueSoonLabel}
                  </span>
                  <p className="font-medium text-slate-800">{item.title}</p>
                </button>
                <button
                  className="text-slate-400 hover:text-slate-600"
                  aria-label={t.notifications.dismiss}
                  onClick={() => dismissOne(item.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
