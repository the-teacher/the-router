/**
 * Tests for basic routing functionality
 * Verifies:
 * - Root route handling
 * - Basic GET route handling
 * - Basic POST route handling
 * - Router initialization
 * - Basic response handling
 */

import path from "path";
import express from "express";
import request from "supertest";
import {
  root,
  get,
  post,
  getRouter,
  setActionsPath,
  resetRouter
} from "../index";

describe("Basic routes", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  beforeEach(() => {
    root("index/index");
    get("/get", "test/get");
    post("/post", "test/post");
  });

  test("should return the correct response for the root route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/");
    expect(response.text).toBe("Hello Index!");
  });

  test("should return the correct response for the GET route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/get");
    expect(response.text).toBe("Hello Get!");
  });

  test("should return the correct response for the POST route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).post("/post");
    expect(response.text).toBe("Hello Post!");
  });
});
