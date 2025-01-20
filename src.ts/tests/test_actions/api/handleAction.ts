import type { Request, Response } from "express";

export const perform = (_req: Request, res: Response): void => {
  res.status(200).json({
    message: "API handler"
  });
};
