import { Router } from "express";
import { z } from "zod";
import { UsersRepository } from "../services/notionService.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const settingsRouter = Router();

const integrationsSchema = z.object({
  notionToken: z.string().optional(),
  lineChannelAccessToken: z.string().optional(),
});

settingsRouter.post("/integrations", async (req: AuthedRequest, res, next) => {
  try {
    const input = integrationsSchema.parse(req.body);
    await UsersRepository.updateIntegrations(req.userId!, {
      notionApiKey: input.notionToken,
      lineChannelAccessToken: input.lineChannelAccessToken,
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
