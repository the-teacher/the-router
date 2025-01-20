import type { Request, Response } from "express";

export const perform = (req: Request, res: Response): void => {
  res.json({
    action: "create",
    data: req.body
  });
};
