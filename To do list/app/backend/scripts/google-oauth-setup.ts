/**
 * One-time interactive script to mint a Google OAuth refresh token for
 * Calendar sync (see ../src/services/googleCalendarService.ts). Run this
 * once locally; the resulting refresh token then lives as a backend env
 * var (GOOGLE_REFRESH_TOKEN) forever — no per-user "Connect Google" flow
 * needed, since this app syncs every task to one calendar.
 *
 * Before running:
 *   1. In Google Cloud Console (the same project used for Notion/other
 *      APIs is fine), enable the "Google Calendar API".
 *   2. Create an OAuth Client ID of type "Desktop app" (this type allows
 *      the loopback redirect below on any port, no need to pre-register
 *      one). Copy its Client ID + Client Secret.
 *
 * Usage:
 *   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... npx tsx scripts/google-oauth-setup.ts
 *
 * The script prints a consent URL — open it, sign in with the Google
 * account whose Calendar should receive synced tasks, and approve. It then
 * prints the refresh token to save as GOOGLE_REFRESH_TOKEN (locally in
 * backend/.env, and on the Render backend service's Environment tab).
 */
import http from "node:http";
import { google } from "googleapis";

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars before running.");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // forces a refresh_token even if this account granted access before
    scope: ["https://www.googleapis.com/auth/calendar"],
  });

  console.log("\nOpen this URL and approve access with the Google account to sync tasks to:\n");
  console.log(authUrl, "\n");

  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "", REDIRECT_URI);
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      if (error) {
        res.end(`<p>Authorization failed: ${error}. You can close this tab.</p>`);
        server.close();
        return reject(new Error(`Google returned an error: ${error}`));
      }
      if (!code) {
        res.end("<p>Waiting for authorization code...</p>");
        return;
      }
      res.end("<p>Done — you can close this tab and go back to the terminal.</p>");
      server.close();
      resolve(code);
    });
    server.listen(PORT);
  });

  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error(
      "Google didn't return a refresh token. If you've authorized this app before, " +
        "revoke access at https://myaccount.google.com/permissions and run this script again.",
    );
  }

  console.log("\nSuccess. Save this as GOOGLE_REFRESH_TOKEN:\n");
  console.log(tokens.refresh_token, "\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
