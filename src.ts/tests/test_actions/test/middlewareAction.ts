import { Request, Response } from "express";

type TestRequest = Request & {
  testData?: string;
};

export const perform = async (req: TestRequest, res: Response) => {
  return res.json({ testData: req.testData });
};
