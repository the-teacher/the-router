import type { Request, Response } from "express";

export const perform = (_req: Request, res: Response): void => {
  res.json({ action: "index" });
};
