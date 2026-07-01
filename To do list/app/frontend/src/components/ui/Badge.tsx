import clsx from "clsx";
import type { TaskPriority, TaskStatus } from "@/types/task";
import { useLocale } from "@/i18n/LocaleContext";

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  low: "bg-pastel-mint/70 text-emerald-700",
  medium: "bg-pastel-lemon/70 text-amber-700",
  high: "bg-pastel-pink/70 text-rose-700",
};

const STATUS_STYLE: Record<TaskStatus, string> = {
  pending: "bg-pastel-sky/70 text-sky-700",
  in_progress: "bg-pastel-lavender/70 text-indigo-700",
  completed: "bg-pastel-mint/70 text-emerald-700",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { t } = useLocale();
  return (
    <span
      className={clsx(
        "rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-glass",
        PRIORITY_STYLE[priority],
      )}
    >
      {t.priority[priority]}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { t } = useLocale();
  return (
    <span
      className={clsx(
        "rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-glass",
        STATUS_STYLE[status],
      )}
    >
      {t.status[status]}
    </span>
  );
}
