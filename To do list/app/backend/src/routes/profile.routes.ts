import { Router } from "express";
import { z } from "zod";
import { UsersRepository } from "../services/notionService.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const profileRouter = Router();

profileRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const user = await UsersRepository.getById(req.userId!);
    res.json({ email: user.email, name: user.name, avatarUrl: user.avatarUrl });
  } catch (err) {
    next(err);
  }
});

const updateProfileSchema = z.object({
  name: z.string().max(200).optional(),
  // A compressed avatar data URL (resized client-side before upload) or ""
  // to remove the current photo.
  avatarUrl: z.string().max(500_000).optional(),
});

profileRouter.patch("/", async (req: AuthedRequest, res, next) => {
  try {
    const input = updateProfileSchema.parse(req.body);
    const user = await UsersRepository.updateProfile(req.userId!, input);
    res.json({ email: user.email, name: user.name, avatarUrl: user.avatarUrl });
  } catch (err) {
    next(err);
  }
});
