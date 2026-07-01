import axios from "axios";

export interface DailyForecast {
  date: string; // ISO date (yyyy-mm-dd)
  weatherCode: number;
  tempMax: number;
  tempMin: number;
}

export interface WeatherData {
  daily: DailyForecast[];
  pm25: number | null;
}

// Defaults to Bangkok since the app's primary audience (Assumption
// University) is based there — swapped for the browser's geolocation when
// the user grants it (see Dashboard.tsx).
export const DEFAULT_COORDS = { latitude: 13.7563, longitude: 100.5018 };

// Open-Meteo: free, no API key, no rate-limit signup — forecast data is
// sourced from national weather services, air quality from Copernicus
// Atmosphere Monitoring Service (CAMS), a credible EU institution.
export async function fetchWeather(
  coords: { latitude: number; longitude: number } = DEFAULT_COORDS,
): Promise<WeatherData> {
  const [forecastRes, airRes] = await Promise.all([
    axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        daily: "weathercode,temperature_2m_max,temperature_2m_min",
        timezone: "auto",
        forecast_days: 7,
      },
    }),
    axios
      .get("https://air-quality-api.open-meteo.com/v1/air-quality", {
        params: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          current: "pm2_5",
          timezone: "auto",
        },
      })
      // Air quality is a secondary widget — don't let it break the forecast
      // card if that endpoint is briefly unavailable.
      .catch(() => null),
  ]);

  const daily = forecastRes.data.daily;
  const days: DailyForecast[] = daily.time.map((date: string, i: number) => ({
    date,
    weatherCode: daily.weathercode[i],
    tempMax: daily.temperature_2m_max[i],
    tempMin: daily.temperature_2m_min[i],
  }));

  return {
    daily: days,
    pm25: airRes?.data?.current?.pm2_5 ?? null,
  };
}

/** WMO weather interpretation codes (used by Open-Meteo) mapped to an emoji
 * so the icon reads the same in every language. */
export function weatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "🌨️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

export type Pm25Level = "veryGood" | "good" | "moderate" | "unhealthySensitive" | "unhealthy";

/** Thresholds roughly follow Thailand's PCD PM2.5 air quality bands (µg/m³). */
export function pm25Level(pm25: number): Pm25Level {
  if (pm25 <= 15) return "veryGood";
  if (pm25 <= 25) return "good";
  if (pm25 <= 37.5) return "moderate";
  if (pm25 <= 75) return "unhealthySensitive";
  return "unhealthy";
}

export const PM25_COLORS: Record<Pm25Level, string> = {
  veryGood: "#22c55e",
  good: "#84cc16",
  moderate: "#eab308",
  unhealthySensitive: "#f97316",
  unhealthy: "#ef4444",
};
