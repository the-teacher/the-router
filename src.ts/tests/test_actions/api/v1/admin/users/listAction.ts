import { Request, Response } from "express";

export const perform = (_req: Request, res: Response) => {
  res.json({ message: "Users list" });
};
