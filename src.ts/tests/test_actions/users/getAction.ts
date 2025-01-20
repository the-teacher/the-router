import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  const { id } = req.params;
  res.status(200).json({
    id,
    message: `Get user ${id}`
  });
};
