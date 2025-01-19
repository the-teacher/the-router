import { Request, Response } from "express";

export const perform = (_req: Request, res: Response) => {
  res.send("V2 Users List!");
};
