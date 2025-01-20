import type { Request, Response } from "express";

export const perform = (_req: Request, res: Response): void => {
  res.send("API Status!");
};
