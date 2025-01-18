import { Response } from "express";
import { TestRequest } from "../../types";

export const perform = (req: TestRequest, res: Response) => {
  return res.json({
    testData: req.testData,
    message: "Protected resource accessed",
  });
};
