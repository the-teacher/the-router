import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  res.header("X-Total-Count", "42").send();
};
