import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  res.json({
    path: req.path,
    message: "Handled by first route",
  });
};
