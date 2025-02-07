import path from "path";
import express from "express";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";
import { get, getRouter, setActionsPath, resetRouter } from "../index";

/**
 * Tests for RegExp-based routing
 * Verifies:
 * - Route matching with regular expressions
 * - RegExp routes with middleware
 * - Route priority and ordering
 * - Path parameter extraction from RegExp matches
 * - Multiple RegExp patterns handling
 */

describe("Routes with RegExp", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  test("should handle routes with RegExp patterns", async () => {
    get(/.*fly$/, "test/regexp");

    const app = express();
    app.use(getRouter());

    // Should match paths ending with 'fly'
    const butterflyResponse = await request(app).get("/butterfly");
    expect(butterflyResponse.status).toBe(200);
    expect(butterflyResponse.body.path).toBe("/butterfly");

    const dragonFlyResponse = await request(app).get("/dragonfly");
    expect(dragonFlyResponse.status).toBe(200);
    expect(dragonFlyResponse.body.path).toBe("/dragonfly");

    // Should not match other paths
    const birdResponse = await request(app).get("/bird");
    expect(birdResponse.status).toBe(404);
  });

  test("should handle RegExp routes with middleware", async () => {
    const authenticate = (req: Request, res: Response, next: NextFunction) => {
      const auth = req.headers.authorization;
      if (auth === "Bearer valid-token") {
        next();
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    };

    get(/^\/secure\/.*$/, [authenticate], "secure/handle");

    const app = express();
    app.use(getRouter());

    // Should fail without auth
    const failedResponse = await request(app).get("/secure/data");
    expect(failedResponse.status).toBe(401);

    // Should succeed with auth
    const successResponse = await request(app)
      .get("/secure/data")
      .set("Authorization", "Bearer valid-token");
    expect(successResponse.status).toBe(200);
    expect(successResponse.body.path).toBe("/secure/data");
  });

  test("should handle multiple RegExp routes in correct order", async () => {
    get(/^\/api\/v1\/users$/, "api/v1/users");
    get(/^\/api\/v1\/.*$/, "api/v1/default");

    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/api/v1/users");
    expect(response.status).toBe(200);
    expect(response.body.path).toBe("/api/v1/users");
    expect(response.body.message).toBe("Handled by first route");
  });
});
