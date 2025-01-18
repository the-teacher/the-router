import path from "path";
import express from "express";
import request from "supertest";
import type { RequestHandler } from "express";
import { resources, getRouter, setActionsPath, resetRouter } from "../index";

describe("resources with options", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "test_actions"));
  });

  test("should handle route intersection when new route is included", async () => {
    resources("posts", { only: ["new", "index", "show"] });

    const app = express();
    app.use(getRouter());

    const response1 = await request(app).get("/posts").expect(200);
    expect(response1.body).toEqual({ action: "index" });

    const response2 = await request(app).get("/posts/123").expect(200);
    expect(response2.body).toEqual({ action: "show", id: "123" });

    // Should match 'new' action because it's included in 'only'
    const response3 = await request(app).get("/posts/new").expect(200);
    expect(response3.body).toEqual({ action: "new" });

    // These routes should not exist
    await request(app).post("/posts").expect(404);
    await request(app).get("/posts/123/edit").expect(404);
    await request(app).put("/posts/123").expect(404);
    await request(app).delete("/posts/123").expect(404);
  });

  test("should handle route intersection when new route is not included", async () => {
    resources("posts", { only: ["index", "show"] });

    const app = express();
    app.use(getRouter());

    const response1 = await request(app).get("/posts").expect(200);
    expect(response1.body).toEqual({ action: "index" });

    const response2 = await request(app).get("/posts/123").expect(200);
    expect(response2.body).toEqual({ action: "show", id: "123" });

    // Should match 'show' action because 'new' is not included in 'only'
    // Express treats 'new' as an :id parameter
    const response3 = await request(app).get("/posts/new").expect(200);
    expect(response3.body).toEqual({ action: "show", id: "new" });

    // These routes should not exist
    await request(app).post("/posts").expect(404);
    await request(app).get("/posts/123/edit").expect(404);
    await request(app).put("/posts/123").expect(404);
    await request(app).delete("/posts/123").expect(404);
  });

  test("should exclude specified routes with except option", async () => {
    resources("posts", { except: ["destroy", "edit", "update"] });

    const app = express();
    app.use(express.json());
    app.use(getRouter());

    // These routes should exist
    const response1 = await request(app).get("/posts").expect(200);
    expect(response1.body).toEqual({ action: "index" });

    const response2 = await request(app).get("/posts/new").expect(200);
    expect(response2.body).toEqual({ action: "new" });

    const response3 = await request(app).post("/posts").send({}).expect(200);
    expect(response3.body).toEqual({ action: "create", data: {} });

    const response4 = await request(app).get("/posts/123").expect(200);
    expect(response4.body).toEqual({ action: "show", id: "123" });

    // These routes should not exist
    await request(app).get("/posts/123/edit").expect(404);
    await request(app).put("/posts/123").expect(404);
    await request(app).patch("/posts/123").expect(404);
    await request(app).delete("/posts/123").expect(404);
  });

  test("should work with both middleware and options", async () => {
    const authenticate: RequestHandler = (req, res, next) => {
      const token = req.header("authorization");
      if (token === "valid-token") {
        next();
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    };

    resources("posts", [authenticate], { only: ["show", "update"] });

    const app = express();
    app.use(express.json());
    app.use(getRouter());

    // Should require authentication
    await request(app).get("/posts/123").expect(401);
    await request(app).put("/posts/123").expect(401);

    // Should work with valid token
    const response1 = await request(app)
      .get("/posts/123")
      .set("Authorization", "valid-token")
      .expect(200);
    expect(response1.body).toEqual({ action: "show", id: "123" });

    const response2 = await request(app)
      .put("/posts/123")
      .set("Authorization", "valid-token")
      .send({})
      .expect(200);
    expect(response2.body).toEqual({
      action: "update",
      id: "123",
      data: {},
    });

    // Other routes should not exist
    await request(app).get("/posts").expect(404);
    await request(app).post("/posts").expect(404);
    await request(app).delete("/posts/123").expect(404);
  });
});
