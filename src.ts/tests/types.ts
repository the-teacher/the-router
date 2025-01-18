import { Request as ExpressRequest } from "express";

export type TestRequest = ExpressRequest & {
  testData?: string;
};
