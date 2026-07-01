import { useEffect, useState } from "react";
import { format } from "date-fns";
import { enUS, th as thLocale } from "date-fns/locale";
import { GlassCard } from "@/components/ui/GlassCard";
import { useLocale } from "@/i18n/LocaleContext";

/** Ticks every second so the clock actually reads as "live" rather than a
 * stale timestamp from whenever the Dashboard happened to mount. */
export function LiveClock() {
  const { locale } = useLocale();
  const dateLocale = locale === "th" ? thLocale : enUS;
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <GlassCard accent="sky" className="flex flex-col items-center justify-center text-center">
      <span className="text-sm text-slate-500">
        {format(now, "EEEE d MMMM yyyy", { locale: dateLocale })}
      </span>
      <span className="mt-1 text-3xl font-bold tabular-nums text-slate-800">
        {format(now, "HH:mm:ss")}
      </span>
    </GlassCard>
  );
}
