import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ action: "show", id });
};
