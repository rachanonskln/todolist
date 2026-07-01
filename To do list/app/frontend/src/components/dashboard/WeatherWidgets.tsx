import { format, parseISO } from "date-fns";
import { enUS, th as thLocale } from "date-fns/locale";
import { GlassCard } from "@/components/ui/GlassCard";
import { useLocale } from "@/i18n/LocaleContext";
import {
  PM25_COLORS,
  pm25Level,
  weatherIcon,
  type WeatherData,
} from "@/lib/weatherApi";

interface WeatherProps {
  weather: WeatherData | null;
  loading: boolean;
}

export function ForecastCard({
  weather,
  loading,
  onUseMyLocation,
}: WeatherProps & { onUseMyLocation: () => void }) {
  const { t, locale } = useLocale();
  const dateLocale = locale === "th" ? thLocale : enUS;

  return (
    <GlassCard accent="lemon">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-700">{t.dashboard.forecast7Day}</h2>
        <button
          onClick={onUseMyLocation}
          className="text-xs text-slate-500 underline decoration-dotted hover:text-slate-700"
        >
          📍 {t.dashboard.useMyLocation}
        </button>
      </div>

      {loading && (
        <div className="flex gap-2 overflow-x-auto">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-24 w-16 shrink-0 rounded-2xl shimmer" />
          ))}
        </div>
      )}

      {!loading && !weather && (
        <p className="text-sm text-slate-500">{t.dashboard.weatherUnavailable}</p>
      )}

      {!loading && weather && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {weather.daily.map((day) => (
            <div
              key={day.date}
              className="flex w-16 shrink-0 flex-col items-center gap-1 rounded-2xl
                bg-white/40 py-3 text-center backdrop-blur-glass"
            >
              <span className="text-xs font-medium text-slate-600">
                {format(parseISO(day.date), "EEE", { locale: dateLocale })}
              </span>
              <span className="text-xl">{weatherIcon(day.weatherCode)}</span>
              <span className="text-xs font-semibold text-slate-800">
                {Math.round(day.tempMax)}°
              </span>
              <span className="text-xs text-slate-400">{Math.round(day.tempMin)}°</span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

export function Pm25Card({ weather, loading }: WeatherProps) {
  const { t } = useLocale();
  const pm25 = weather?.pm25;

  const level = pm25 != null ? pm25Level(pm25) : null;

  return (
    <GlassCard accent="mint" className="flex flex-col items-center justify-center text-center">
      <span className="text-sm text-slate-500">{t.dashboard.pm25}</span>

      {loading && <div className="mt-2 h-9 w-20 rounded-xl shimmer" />}

      {!loading && pm25 == null && (
        <span className="mt-1 text-sm text-slate-400">{t.dashboard.weatherUnavailable}</span>
      )}

      {!loading && pm25 != null && level && (
        <>
          <span className="mt-1 text-3xl font-bold text-slate-800">
            {pm25.toFixed(1)}
            <span className="ml-1 text-sm font-normal text-slate-500">
              {t.dashboard.pm25Unit}
            </span>
          </span>
          <span
            className="mt-1 rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: PM25_COLORS[level] }}
          >
            {t.dashboard.pm25Level[level]}
          </span>
        </>
      )}
    </GlassCard>
  );
}
