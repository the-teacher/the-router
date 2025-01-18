import path from "path";
import express from "express";
import request from "supertest";
import {
  resources,
  getRouter,
  setActionsPath,
  resetRouter,
  setRouterOptions,
  routeScope as scope,
} from "../index";

describe("Router Configuration", () => {
  beforeEach(() => {
    resetRouter();
  });

  test("should use default router options when not configured", async () => {
    setActionsPath(path.join(__dirname, "./test_actions"));
    resources("posts");
    const app = express();
    app.use(getRouter());

    // By default, trailing slashes are treated the same
    const response1 = await request(app).get("/posts").expect(200);
    const response2 = await request(app).get("/posts/").expect(200);
    expect(response1.body).toEqual(response2.body);

    // By default, case is ignored
    const response3 = await request(app).get("/POSTS").expect(200);
    expect(response3.body).toEqual(response1.body);
  });

  test("should respect strict routing option", async () => {
    setActionsPath(path.join(__dirname, "./test_actions"));
    setRouterOptions({ strict: true });
    resources("posts");
    const app = express();
    app.use(getRouter());
    // Add 404 handler
    app.use((_req, res) => {
      res.status(404).json({
        error: "Not Found",
        message: res.statusMessage || "Not Found",
      });
    });

    // With strict routing, trailing slashes matter
    const response1 = await request(app).get("/posts").expect(200);
    const response2 = await request(app).get("/posts/").expect(404);

    expect(response1.body).toEqual({ action: "index" });
    expect(response2.body).toEqual({
      error: "Not Found",
      message: "Not Found",
    });
  });

  test("should respect case sensitive routing option", async () => {
    setActionsPath(path.join(__dirname, "./test_actions"));
    setRouterOptions({ caseSensitive: true });
    resources("posts");
    const app = express();
    app.use(getRouter());
    // Add 404 handler
    app.use((_req, res) => {
      res.status(404).json({
        error: "Not Found",
        message: res.statusMessage || "Not Found",
      });
    });

    // With case sensitive routing, case matters
    const response1 = await request(app).get("/posts").expect(200);
    const response2 = await request(app).get("/POSTS").expect(404);

    expect(response1.body).toEqual({ action: "index" });
    expect(response2.body).toEqual({
      error: "Not Found",
      message: "Not Found",
    });
  });

  test("should apply options to scoped routes", async () => {
    setActionsPath(path.join(__dirname, "./test_actions"));
    setRouterOptions({ strict: true, caseSensitive: true });

    scope("admin", () => {
      resources("posts");
    });

    const app = express();
    app.use(getRouter());

    // Options should affect scoped routes
    const response1 = await request(app).get("/admin/posts").expect(200);
    await request(app).get("/admin/posts/").expect(404); // strict: true
    await request(app).get("/ADMIN/posts").expect(404); // caseSensitive: true
    expect(response1.body).toEqual({ action: "index" });
  });

  test("should reset options when router is reset", async () => {
    setRouterOptions({ strict: true, caseSensitive: true });
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
    resources("posts");

    const app = express();
    app.use(getRouter());

    // After reset, should use default options
    const response1 = await request(app).get("/posts").expect(200);
    const response2 = await request(app).get("/posts/").expect(200);
    const response3 = await request(app).get("/POSTS").expect(200);
    expect(response1.body).toEqual(response2.body);
    expect(response1.body).toEqual(response3.body);
  });
});
