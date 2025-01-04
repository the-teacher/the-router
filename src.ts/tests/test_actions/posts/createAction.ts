import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  res.json({ action: "create", data: req.body });
};
