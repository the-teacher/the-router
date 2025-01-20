import type { Request, Response } from "express";

export const perform = (req: Request, res: Response): void => {
  const { id } = req.params;
  res.json({
    action: "update",
    id,
    data: req.body
  });
};
