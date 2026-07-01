import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { requireAuth, requireInternalKey } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { tasksRouter } from "./routes/tasks.routes.js";
import { categoriesRouter } from "./routes/categories.routes.js";
import { lineRouter } from "./routes/line.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { profileRouter } from "./routes/profile.routes.js";
import { holidaysRouter } from "./routes/holidays.routes.js";
import { internalRouter } from "./routes/internal.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
// Raised from Express's 100kb default: profile avatar photos are uploaded as
// compressed base64 data URLs in the request body.
app.use(express.json({ limit: "2mb" }));

// Public
app.use("/api/auth", authRouter);
app.use("/line", lineRouter); // LINE verifies via its own HMAC middleware, not JWT

// Authenticated (user-facing app)
app.use("/api/tasks", requireAuth, tasksRouter);
app.use("/api/categories", requireAuth, categoriesRouter);
app.use("/api/profile", requireAuth, profileRouter);
app.use("/api/holidays", requireAuth, holidaysRouter);

// Internal service-to-service (Scheduler Service, AI Processing Module)
app.use("/internal", requireInternalKey, internalRouter);

app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Backend API listening on :${env.port}`);
});
