import type { Request, Response } from "express";

export const perform = (req: Request, res: Response): void => {
  res.status(200).json({
    path: req.path,
    message: "Handled by first route"
  });
};
