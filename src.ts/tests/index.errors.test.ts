import path from "path";
import express from "express";
import request from "supertest";
import {
  root,
  get,
  getRouter,
  setActionsPath,
  resetRouter,
  routeScope as scope
} from "../index";

describe("Missing Action Tests", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  test("should return 501 when action file does not exist", async () => {
    root("non_existent/index");

    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/");
    expect(response.status).toBe(501);
    expect(response.body).toEqual({
      error: "Action loading failed",
      message: "Failed to load the specified action",
      details: expect.any(String)
    });
  });

  test("should return 501 for missing action in scope", async () => {
    scope("admin", () => {
      get("/users", "admin/missing/list");
    });

    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/admin/users");
    expect(response.status).toBe(501);
    expect(response.body).toEqual({
      error: "Action loading failed",
      message: "Failed to load the specified action",
      details: expect.any(String)
    });
  });
});
