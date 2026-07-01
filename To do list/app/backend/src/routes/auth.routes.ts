import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UsersRepository } from "../services/notionService.js";
import { env } from "../config/env.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await UsersRepository.findByEmail(email);

    // Compare against a stored bcrypt hash even when no user is found, so
    // response timing doesn't leak which emails are registered.
    const valid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, "$2a$10$invalidsaltinvalidsaltinvalidsalu");

    if (!user || !valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});
