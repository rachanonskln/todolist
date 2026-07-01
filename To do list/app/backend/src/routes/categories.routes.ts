import { Router } from "express";
import { z } from "zod";
import { CategoriesRepository } from "../services/notionService.js";

export const categoriesRouter = Router();

const categoryInputSchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

categoriesRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await CategoriesRepository.list());
  } catch (err) {
    next(err);
  }
});

categoriesRouter.post("/", async (req, res, next) => {
  try {
    const input = categoryInputSchema.parse(req.body);
    res.status(201).json(await CategoriesRepository.create(input));
  } catch (err) {
    next(err);
  }
});
