/**
 * One-time utility to create (or update) a login account in the Notion
 * Users database. Never hardcode a real email/password here — always pass
 * them as env vars so credentials never end up in git history.
 *
 * Usage:
 *   SEED_USER_EMAIL=you@example.com SEED_USER_PASSWORD='...' \
 *     npx tsx scripts/seed-user.ts
 *
 * Requires backend/.env to already have NOTION_API_KEY and
 * NOTION_USERS_DB_ID pointing at a real, created Notion database (see
 * ../../notion-schemas/users_database.json).
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { Client } from "@notionhq/client";

async function main() {
  const email = process.env.SEED_USER_EMAIL;
  const password = process.env.SEED_USER_PASSWORD;
  const notionApiKey = process.env.NOTION_API_KEY;
  const usersDbId = process.env.NOTION_USERS_DB_ID;

  if (!email || !password) {
    throw new Error("Set SEED_USER_EMAIL and SEED_USER_PASSWORD env vars before running.");
  }
  if (!notionApiKey || !usersDbId) {
    throw new Error("Set NOTION_API_KEY and NOTION_USERS_DB_ID in backend/.env first.");
  }

  const notion = new Client({ auth: notionApiKey });
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await notion.databases.query({
    database_id: usersDbId,
    filter: { property: "Email", email: { equals: email } },
  });

  const properties = {
    Name: { title: [{ text: { content: email.split("@")[0] } }] },
    Email: { email },
    PasswordHash: { rich_text: [{ text: { content: passwordHash } }] },
  };

  if (existing.results[0]) {
    await notion.pages.update({ page_id: existing.results[0].id, properties });
    console.log(`Updated password for existing user: ${email}`);
  } else {
    await notion.pages.create({
      parent: { database_id: usersDbId },
      properties: {
        ...properties,
        EmailIntegrationStatus: { select: { name: "disconnected" } },
      },
    });
    console.log(`Created new user: ${email}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
