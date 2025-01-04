import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  res.header("Allow", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD").send();
};
