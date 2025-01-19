import { Request, Response } from "express";

export const perform = (_req: Request, res: Response) => {
  res.send("Create V1 User!");
};
