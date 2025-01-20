import path from "path";
import express from "express";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";
import {
  put,
  patch,
  destroy,
  options,
  head,
  all,
  getRouter,
  setActionsPath,
  resetRouter
} from "../index";

describe("HTTP Methods", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  test("should handle PUT requests", async () => {
    put("/users/1", "users/update");

    const app = express();
    app.use(getRouter());

    const response = await request(app).put("/users/1");
    expect(response.status).toBe(200);
  });

  test("should handle PATCH requests", async () => {
    patch("/users/1", "users/update");

    const app = express();
    app.use(getRouter());

    const response = await request(app).patch("/users/1");
    expect(response.status).toBe(200);
  });

  test("should handle DELETE requests", async () => {
    destroy("/users/1", "users/update");

    const app = express();
    app.use(getRouter());

    const response = await request(app).delete("/users/1");
    expect(response.status).toBe(200);
  });

  test("should handle OPTIONS requests", async () => {
    options("/users", "users/options");

    const app = express();
    app.use(getRouter());

    const response = await request(app).options("/users");
    expect(response.status).toBe(200);
  });

  test("should handle HEAD requests", async () => {
    head("/users", "users/head");

    const app = express();
    app.use(getRouter());

    const response = await request(app).head("/users");
    expect(response.status).toBe(200);
  });

  test("should handle ALL method", async () => {
    all("/api", "api/handle");

    const app = express();
    app.use(getRouter());

    // Should respond to any HTTP method
    const getResponse = await request(app).get("/api");
    expect(getResponse.status).toBe(200);

    const postResponse = await request(app).post("/api");
    expect(postResponse.status).toBe(200);

    const putResponse = await request(app).put("/api");
    expect(putResponse.status).toBe(200);

    const deleteResponse = await request(app).delete("/api");
    expect(deleteResponse.status).toBe(200);
  });

  test("should handle middleware for new methods", async () => {
    const authenticate = (req: Request, res: Response, next: NextFunction) => {
      const auth = req.headers.authorization;
      if (auth === "Bearer valid-token") {
        next();
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    };

    put("/users/1", [authenticate], "users/update");
    patch("/users/1", [authenticate], "users/update");
    destroy("/users/1", [authenticate], "users/update");

    const app = express();
    app.use(getRouter());

    // Should fail without auth
    const failedPut = await request(app).put("/users/1");
    expect(failedPut.status).toBe(401);

    const failedPatch = await request(app).patch("/users/1");
    expect(failedPatch.status).toBe(401);

    const failedDelete = await request(app).delete("/users/1");
    expect(failedDelete.status).toBe(401);

    // Should succeed with auth
    const successPut = await request(app)
      .put("/users/1")
      .set("Authorization", "Bearer valid-token");
    expect(successPut.status).toBe(200);

    const successPatch = await request(app)
      .patch("/users/1")
      .set("Authorization", "Bearer valid-token");
    expect(successPatch.status).toBe(200);

    const successDelete = await request(app)
      .delete("/users/1")
      .set("Authorization", "Bearer valid-token");
    expect(successDelete.status).toBe(200);
  });
});
