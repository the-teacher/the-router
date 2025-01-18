import { Response } from "express";
import { TestRequest } from "../../types";

export const perform = async (req: TestRequest, res: Response) => {
  return res.json({ testData: req.testData });
};
