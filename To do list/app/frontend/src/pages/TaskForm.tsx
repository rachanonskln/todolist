import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { CategoriesApi, TasksApi } from "@/lib/api";
import type { Category, TaskInput, TaskPriority, TaskStatus } from "@/types/task";
import { useLocale } from "@/i18n/LocaleContext";

/** <input type="datetime-local"> only accepts "yyyy-MM-ddTHH:mm" — the API
 * returns full ISO strings like "2026-07-02T03:05:00.000+00:00", which the
 * input silently rejects (leaving the field blank on edit).
 *
 * We take the literal wall-clock components (first 16 chars) rather than
 * converting through a timezone: the create flow already stores the raw
 * datetime-local value as-is, so reading it back the same naive way keeps an
 * edit round-trip stable instead of drifting the time by the browser's UTC
 * offset each save. */
function toDateTimeLocal(iso: string): string {
  return iso ? iso.slice(0, 16) : "";
}

const emptyForm: TaskInput = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "pending",
  priority: "medium",
  lineUserId: "",
  assignee: "",
  reminderMinutesBefore: 30,
};

export function TaskForm() {
  const { t } = useLocale();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<TaskInput>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    CategoriesApi.list()
      .then(setCategories)
      .catch((err) => console.error("Failed to load categories", err));
    TasksApi.listAssignees()
      .then(setAssigneeOptions)
      .catch((err) => console.error("Failed to load assignees", err));
    if (isEdit && id) {
      TasksApi.get(id).then((task) =>
        setForm({
          title: task.title,
          description: task.description ?? "",
          startDate: toDateTimeLocal(task.startDate),
          endDate: toDateTimeLocal(task.endDate),
          status: task.status,
          priority: task.priority,
          categoryId: task.categoryId,
          lineUserId: task.lineUserId ?? "",
          assignee: task.assignee ?? "",
          reminderMinutesBefore: task.reminderMinutesBefore ?? 30,
        }),
      );
    }
  }, [id, isEdit]);

  const update = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit && id) {
        await TasksApi.update(id, form);
      } else {
        await TasksApi.create(form);
      }
      navigate("/");
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassCard className="mx-auto max-w-xl">
      <h2 className="mb-5 text-lg font-semibold text-slate-800">
        {isEdit ? t.taskForm.editTitle : t.taskForm.newTitle}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-slate-600">{t.taskForm.title}</label>
          <input
            required
            className="glass-input"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder={t.taskForm.titlePlaceholder}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">{t.taskForm.description}</label>
          <textarea
            className="glass-input min-h-24"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-slate-600">{t.taskForm.start}</label>
            <input
              required
              type="datetime-local"
              className="glass-input"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">{t.taskForm.end}</label>
            <input
              required
              type="datetime-local"
              className="glass-input"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-slate-600">{t.taskForm.priority}</label>
            <select
              className="glass-input"
              value={form.priority}
              onChange={(e) => update("priority", e.target.value as TaskPriority)}
            >
              <option value="low">{t.priority.low}</option>
              <option value="medium">{t.priority.medium}</option>
              <option value="high">{t.priority.high}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">{t.taskForm.status}</label>
            <select
              className="glass-input"
              value={form.status}
              onChange={(e) => update("status", e.target.value as TaskStatus)}
            >
              <option value="pending">{t.status.pending}</option>
              <option value="in_progress">{t.status.in_progress}</option>
              <option value="completed">{t.status.completed}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">{t.taskForm.category}</label>
          <select
            className="glass-input"
            value={form.categoryId ?? ""}
            onChange={(e) => update("categoryId", e.target.value || undefined)}
          >
            <option value="">{t.taskForm.uncategorized}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">
            {t.taskForm.remindBefore}
          </label>
          <input
            type="number"
            min={0}
            className="glass-input"
            value={form.reminderMinutesBefore}
            onChange={(e) => update("reminderMinutesBefore", Number(e.target.value))}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">{t.taskForm.assignee}</label>
          <input
            className="glass-input"
            list="assignee-options"
            value={form.assignee ?? ""}
            onChange={(e) => update("assignee", e.target.value)}
            placeholder={t.taskForm.assigneePlaceholder}
          />
          <datalist id="assignee-options">
            {assigneeOptions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">{t.taskForm.lineUserId}</label>
          <input
            className="glass-input"
            value={form.lineUserId ?? ""}
            onChange={(e) => update("lineUserId", e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-400">{t.taskForm.lineUserIdHint}</p>
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <GlassButton type="button" onClick={() => navigate(-1)}>
            {t.taskForm.cancel}
          </GlassButton>
          <GlassButton type="submit" variant="primary" disabled={saving}>
            {saving ? t.taskForm.saving : t.taskForm.save}
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
}
