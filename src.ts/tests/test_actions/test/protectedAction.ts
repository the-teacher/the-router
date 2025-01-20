import { Request, Response } from "express";

type TestRequest = Request & {
  testData?: string;
};

export const perform = (req: TestRequest, res: Response) => {
  return res.json({
    testData: req.testData,
    message: "Protected resource accessed"
  });
};
