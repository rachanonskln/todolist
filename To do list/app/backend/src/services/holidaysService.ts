export interface Holiday {
  date: string; // ISO date (yyyy-mm-dd)
  name: string;
}

// Google's own public "Holidays in Thailand" calendar — maintained by Google,
// sourced from Thailand's official public/bank holidays, no API key needed.
// (Verified Nager.Date does NOT cover Thailand before picking this source.)
const ICS_URL =
  "https://calendar.google.com/calendar/ical/en.th%23holiday%40group.v.calendar.google.com/public/basic.ics";

let cache: { fetchedAt: number; holidays: Holiday[] } | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function parseIcs(ics: string): Holiday[] {
  // Unfold lines per RFC 5545 (continuation lines start with a space).
  const unfolded = ics.replace(/\r\n /g, "").replace(/\n /g, "");
  const events = unfolded.split("BEGIN:VEVENT").slice(1);

  return events
    .map((block) => {
      const dateMatch = block.match(/DTSTART;VALUE=DATE:(\d{8})/);
      const nameMatch = block.match(/SUMMARY:(.+)/);
      if (!dateMatch || !nameMatch) return null;
      const raw = dateMatch[1];
      const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      return { date, name: nameMatch[1].trim() };
    })
    .filter((h): h is Holiday => h !== null);
}

export async function fetchThaiHolidays(): Promise<Holiday[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.holidays;
  }
  const response = await fetch(ICS_URL);
  if (!response.ok) throw new Error(`Failed to fetch Thai holidays: HTTP ${response.status}`);
  const holidays = parseIcs(await response.text());
  cache = { fetchedAt: Date.now(), holidays };
  return holidays;
}
