import { Response, NextFunction } from "express";
import { RequestHandler } from "express";
import { TestRequest } from "../types";

// Test middleware that adds data to request
export const addDataMiddleware = (
  req: TestRequest,
  res: Response,
  next: NextFunction
) => {
  req.testData = "middleware data";
  next();
};

// Test middleware that checks authorization
export const authMiddleware: RequestHandler = (
  req: TestRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader === "Bearer valid-token") {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};
