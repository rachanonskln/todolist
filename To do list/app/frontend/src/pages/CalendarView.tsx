import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { enUS, th as thLocale } from "date-fns/locale";
import clsx from "clsx";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { CategoriesApi, TasksApi } from "@/lib/api";
import { fetchThaiHolidays, type Holiday } from "@/lib/holidaysApi";
import type { Category, Task } from "@/types/task";
import { useLocale } from "@/i18n/LocaleContext";

export function CalendarView() {
  const { locale, t } = useLocale();
  const dateLocale = locale === "th" ? thLocale : enUS;

  const [cursor, setCursor] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    TasksApi.list()
      .then(setTasks)
      .catch((err) => console.error("Failed to load tasks", err));
    CategoriesApi.list()
      .then(setCategories)
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  useEffect(() => {
    fetchThaiHolidays()
      .then(setHolidays)
      .catch((err) => console.error("Failed to load Thai holidays", err));
  }, []);

  const holidayByDate = useMemo(() => new Map(holidays.map((h) => [h.date, h])), [holidays]);
  const holidayOn = (day: Date) => holidayByDate.get(format(day, "yyyy-MM-dd"));

  const tasksByDay = (day: Date) =>
    tasks.filter((t) => isSameDay(parseISO(t.startDate), day));

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <GlassCard className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <GlassButton onClick={() => setCursor((d) => subMonths(d, 1))}>‹</GlassButton>
          <h2 className="text-base font-semibold text-slate-700">
            {format(cursor, "MMMM yyyy", { locale: dateLocale })}
          </h2>
          <GlassButton onClick={() => setCursor((d) => addMonths(d, 1))}>›</GlassButton>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-500">
          {t.calendar.weekdays.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayTasks = tasksByDay(day);
            const holiday = holidayOn(day);
            const inMonth = isSameMonth(day, cursor);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                title={holiday?.name}
                className={clsx(
                  "flex h-20 flex-col items-start rounded-2xl border border-white/30 p-2 text-left transition",
                  inMonth ? "bg-white/40" : "bg-white/10 text-slate-400",
                  holiday && inMonth && "bg-pastel-pink/30",
                  selectedDay && isSameDay(day, selectedDay) && "ring-2 ring-pastel-sky",
                  "hover:bg-white/60",
                )}
              >
                <span className="flex w-full items-center justify-between text-xs font-semibold">
                  {format(day, "d")}
                  {holiday && <span aria-hidden>🇹🇭</span>}
                </span>
                {holiday && (
                  <span className="line-clamp-1 text-[10px] text-rose-500">{holiday.name}</span>
                )}
                <div className="mt-1 flex flex-wrap gap-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <span
                      key={task.id}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: task.categoryId
                          ? categoryById.get(task.categoryId)?.color ?? "#cdeeff"
                          : "#cdeeff",
                      }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="w-full md:w-72">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">
          {selectedDay ? format(selectedDay, "PPP", { locale: dateLocale }) : t.calendar.selectDay}
        </h3>
        {selectedDay && holidayOn(selectedDay) && (
          <p className="mb-3 rounded-xl bg-pastel-pink/30 px-3 py-2 text-sm text-rose-600">
            🇹🇭 {holidayOn(selectedDay)!.name}
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {(selectedDay ? tasksByDay(selectedDay) : []).map((t) => (
            <li key={t.id} className="rounded-xl bg-white/40 p-3 text-sm">
              <p className="font-medium text-slate-800">{t.title}</p>
              <p className="text-xs text-slate-500">
                {format(parseISO(t.startDate), "HH:mm")} –{" "}
                {format(parseISO(t.endDate), "HH:mm")}
              </p>
            </li>
          ))}
          {selectedDay && tasksByDay(selectedDay).length === 0 && (
            <p className="text-sm text-slate-500">{t.calendar.noTasksThisDay}</p>
          )}
        </ul>
      </GlassCard>
    </div>
  );
}
