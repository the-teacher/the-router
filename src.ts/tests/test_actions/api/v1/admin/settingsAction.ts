import { Request, Response } from "express";

export const perform = (_req: Request, res: Response) => {
  res.send("Update Admin Settings!");
};
