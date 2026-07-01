import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { useLocale } from "@/i18n/LocaleContext";
import type { Task } from "@/types/task";

interface AiReviewCardProps {
  tasks: Task[];
  onApprove: (task: Task) => void;
  onReject: (task: Task) => void;
}

/** Surfaces tasks the AI module created from email/LINE text that the user
 * hasn't confirmed yet (Task.needsReview) — extraction from free text can
 * misread dates or invent details, so nothing here counts as a real to-do
 * until approved. */
export function AiReviewCard({ tasks, onApprove, onReject }: AiReviewCardProps) {
  const { t } = useLocale();

  if (tasks.length === 0) return null;

  return (
    <GlassCard accent="lilac">
      <h2 className="text-base font-semibold text-slate-700">{t.aiReview.title}</h2>
      <p className="mb-4 text-sm text-slate-500">{t.aiReview.subtitle}</p>

      <ul className="flex flex-col gap-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between rounded-2xl border border-white/40
              bg-white/40 px-4 py-3 backdrop-blur-glass"
          >
            <div>
              <p className="font-medium text-slate-800">{task.title}</p>
              {task.description && (
                <p className="text-xs text-slate-500">{task.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <GlassButton onClick={() => onReject(task)} className="!px-3 !py-1.5 text-xs">
                {t.aiReview.reject}
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={() => onApprove(task)}
                className="!px-3 !py-1.5 text-xs"
              >
                {t.aiReview.approve}
              </GlassButton>
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
