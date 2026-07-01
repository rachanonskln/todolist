import { api } from "@/lib/api";

export interface Holiday {
  date: string; // ISO date (yyyy-mm-dd)
  name: string;
}

let cached: Promise<Holiday[]> | null = null;

// Proxied through the backend (see backend/src/services/holidaysService.ts),
// which reads Google's own public "Holidays in Thailand" calendar feed —
// free, no API key, and Google doesn't set CORS headers on it so it can't be
// fetched directly from the browser.
export async function fetchThaiHolidays(): Promise<Holiday[]> {
  if (!cached) {
    cached = api.get<Holiday[]>("/holidays").then((r) => r.data);
  }
  return cached;
}
