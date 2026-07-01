export interface Holiday {
  date: string; // ISO date (yyyy-mm-dd)
  name: { en: string; th: string };
}

// Google publishes the same "Holidays in Thailand" calendar in two
// languages under different calendar ids — same events/dates, localized
// SUMMARY text — so the Calendar view can match whichever locale the user
// has selected (see LocaleContext) instead of always showing English.
const ICS_URLS = {
  en: "https://calendar.google.com/calendar/ical/en.th%23holiday%40group.v.calendar.google.com/public/basic.ics",
  th: "https://calendar.google.com/calendar/ical/th.th%23holiday%40group.v.calendar.google.com/public/basic.ics",
};

let cache: { fetchedAt: number; holidays: Holiday[] } | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function parseIcs(ics: string): Map<string, string> {
  // Unfold lines per RFC 5545 (continuation lines start with a space).
  const unfolded = ics.replace(/\r\n /g, "").replace(/\n /g, "");
  const events = unfolded.split("BEGIN:VEVENT").slice(1);

  const byDate = new Map<string, string>();
  for (const block of events) {
    const dateMatch = block.match(/DTSTART;VALUE=DATE:(\d{8})/);
    const nameMatch = block.match(/SUMMARY:(.+)/);
    if (!dateMatch || !nameMatch) continue;
    const raw = dateMatch[1];
    const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    byDate.set(date, nameMatch[1].trim());
  }
  return byDate;
}

async function fetchIcs(url: string): Promise<Map<string, string>> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch Thai holidays: HTTP ${response.status}`);
  return parseIcs(await response.text());
}

export async function fetchThaiHolidays(): Promise<Holiday[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.holidays;
  }

  const [en, th] = await Promise.all([fetchIcs(ICS_URLS.en), fetchIcs(ICS_URLS.th)]);
  const holidays: Holiday[] = [...en.entries()].map(([date, nameEn]) => ({
    date,
    name: { en: nameEn, th: th.get(date) ?? nameEn },
  }));

  cache = { fetchedAt: Date.now(), holidays };
  return holidays;
}
