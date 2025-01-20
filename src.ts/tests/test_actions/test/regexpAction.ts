import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  res.status(200).json({
    path: req.path,
    message: "RegExp route handler"
  });
};
