import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  res.json({ message: `Handled ${req.method} request` });
};
