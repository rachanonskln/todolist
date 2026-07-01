import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

// Centralizing env access means a missing var fails fast at boot instead of
// surfacing as a confusing 500 deep inside a request handler.
export const env = {
  port: Number(process.env.PORT ?? 4000),
  notion: {
    apiKey: required("NOTION_API_KEY"),
    tasksDbId: required("NOTION_TASKS_DB_ID"),
    categoriesDbId: required("NOTION_CATEGORIES_DB_ID"),
    usersDbId: required("NOTION_USERS_DB_ID"),
    logsDbId: required("NOTION_LOGS_DB_ID"),
  },
  line: {
    channelAccessToken: required("LINE_CHANNEL_ACCESS_TOKEN"),
    channelSecret: required("LINE_CHANNEL_SECRET"),
  },
  jwtSecret: required("JWT_SECRET"),
  internalApiKey: required("INTERNAL_API_KEY"),
  aiModuleUrl: process.env.AI_MODULE_URL ?? "http://localhost:8000",
  // Google Calendar sync is optional: until these are set (via the one-time
  // OAuth flow in scripts/google-oauth-setup.ts), googleCalendarService
  // no-ops instead of failing every task write.
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN ?? "",
    calendarId: process.env.GOOGLE_CALENDAR_ID ?? "primary",
  },
};
