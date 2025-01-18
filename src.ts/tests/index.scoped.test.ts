import path from "path";
import express from "express";
import request from "supertest";
import {
  getRouter,
  setActionsPath,
  resetRouter,
  routeScope as scope,
  get,
  post,
} from "../index";

describe("Scoped routes", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  beforeEach(() => {
    scope("admin", () => {
      get("show", "admin/show");
      post("update", "admin/update");
    });
  });

  test("should return correct response for scoped GET route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/admin/show");
    expect(response.text).toBe("Admin Show!");
  });

  test("should return correct response for scoped POST route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).post("/admin/update");
    expect(response.text).toBe("Admin Update!");
  });

  test("should return 404 for invalid scoped route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/admin/invalid");
    expect(response.status).toBe(404);
  });
});
