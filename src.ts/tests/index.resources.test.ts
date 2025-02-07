/**
 * Tests for RESTful resource routing
 * Verifies:
 * - Standard CRUD routes (index, show, new, create, edit, update, destroy)
 * - Resource routes with middleware
 * - Scoped resources
 * - HTTP methods mapping (GET, POST, PUT, PATCH, DELETE)
 * - Path parameter handling
 */

import path from "path";
import express from "express";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";
import {
  resources,
  getRouter,
  setActionsPath,
  resetRouter,
  routeScope as scope
} from "../index";

describe("Resource Routes", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
    resources("posts");
  });

  test("should create index route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/posts");
    expect(response.status).toBe(200);
    expect(response.body.action).toBe("index");
  });

  test("should create show route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/posts/123");
    expect(response.status).toBe(200);
    expect(response.body.action).toBe("show");
    expect(response.body.id).toBe("123");
  });

  test("should create new route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/posts/new");
    expect(response.status).toBe(200);
    expect(response.body.action).toBe("new");
  });

  test("should create create route", async () => {
    const app = express();
    app.use(express.json());
    app.use(getRouter());

    const postData = { title: "New Post", content: "Content" };
    const response = await request(app).post("/posts").send(postData);

    expect(response.status).toBe(200);
    expect(response.body.action).toBe("create");
    expect(response.body.data).toEqual(postData);
  });

  test("should create edit route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/posts/123/edit");
    expect(response.status).toBe(200);
    expect(response.body.action).toBe("edit");
    expect(response.body.id).toBe("123");
  });

  test("should create update routes (PUT and PATCH)", async () => {
    const app = express();
    app.use(express.json());
    app.use(getRouter());

    const updateData = { title: "Updated Post" };

    const putResponse = await request(app).put("/posts/123").send(updateData);

    expect(putResponse.status).toBe(200);
    expect(putResponse.body.action).toBe("update");
    expect(putResponse.body.id).toBe("123");
    expect(putResponse.body.data).toEqual(updateData);

    const patchResponse = await request(app)
      .patch("/posts/123")
      .send(updateData);

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.action).toBe("update");
    expect(patchResponse.body.id).toBe("123");
    expect(patchResponse.body.data).toEqual(updateData);
  });

  test("should create destroy route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).delete("/posts/123");
    expect(response.status).toBe(200);
    expect(response.body.action).toBe("destroy");
    expect(response.body.id).toBe("123");
  });

  test("should handle resource routes with middleware", async () => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));

    const authenticate = (req: Request, res: Response, next: NextFunction) => {
      const auth = req.headers.authorization;
      if (auth === "Bearer valid-token") {
        next();
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    };

    resources("posts", [authenticate]);

    const app = express();
    app.use(getRouter());

    // Should fail without auth
    const failedResponse = await request(app).get("/posts");
    expect(failedResponse.status).toBe(401);

    // Should succeed with auth
    const successResponse = await request(app)
      .get("/posts")
      .set("Authorization", "Bearer valid-token");
    expect(successResponse.status).toBe(200);
  });

  test("should handle scoped resources", async () => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));

    scope("admin", () => {
      resources("posts");
    });

    const app = express();
    app.use(getRouter());

    const indexResponse = await request(app).get("/admin/posts");
    expect(indexResponse.status).toBe(200);
    expect(indexResponse.body.action).toBe("index");

    const showResponse = await request(app).get("/admin/posts/123");
    expect(showResponse.status).toBe(200);
    expect(showResponse.body.action).toBe("show");
    expect(showResponse.body.id).toBe("123");
  });
});
