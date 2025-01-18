import { Request, Response } from "express";

export const perform = (_req: Request, res: Response) => {
  res.status(200).header("Allow", "GET, POST, PUT, DELETE, OPTIONS").send();
};
