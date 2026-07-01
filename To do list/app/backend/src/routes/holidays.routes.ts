import { Router } from "express";
import { fetchThaiHolidays } from "../services/holidaysService.js";

export const holidaysRouter = Router();

holidaysRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await fetchThaiHolidays());
  } catch (err) {
    next(err);
  }
});
