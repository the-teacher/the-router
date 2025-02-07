import path from "path";
import express from "express";
import request from "supertest";
import {
  get,
  getRouter,
  setActionsPath,
  resetRouter,
  routeScope as scope
} from "../index";
import type { Request, Response, NextFunction } from "express";

/**
 * Tests for middleware execution ordering
 * Verifies:
 * - Nested scope middleware execution order
 * - Route-specific middleware positioning
 * - Multiple middleware ordering at same scope
 * - Error handling middleware chain
 * - Parallel routes middleware execution
 */

describe("Middleware Execution Order", () => {
  // Store execution order
  let executionOrder: number[];

  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
    executionOrder = [];
  });

  // Helper to create numbered middleware
  const createMiddleware = (num: number) => {
    return (_req: Request, _res: Response, next: NextFunction) => {
      executionOrder.push(num);
      next();
    };
  };

  test("should execute middlewares in correct order for deeply nested routes", async () => {
    // Create nested scopes with numbered middlewares
    scope("api", [createMiddleware(1)], () => {
      scope("v1", [createMiddleware(2)], () => {
        scope("admin", [createMiddleware(3)], () => {
          scope("users", [createMiddleware(4)], () => {
            get("list", [createMiddleware(5)], "api/v1/admin/users/list");
          });
        });
      });
    });

    const app = express();
    app.use(getRouter());

    await request(app).get("/api/v1/admin/users/list");

    // Verify middlewares executed in order from outermost to innermost
    expect(executionOrder).toEqual([1, 2, 3, 4, 5]);
  });

  test("should execute route-specific middleware after scope middlewares", async () => {
    scope("api", [createMiddleware(1)], () => {
      get("status", [createMiddleware(2)], "api/status");
    });

    const app = express();
    app.use(getRouter());

    await request(app).get("/api/status");

    expect(executionOrder).toEqual([1, 2]);
  });

  test("should handle multiple middlewares at same scope level in order", async () => {
    scope("api", [createMiddleware(1), createMiddleware(2)], () => {
      scope("v1", [createMiddleware(3), createMiddleware(4)], () => {
        get(
          "status",
          [createMiddleware(5), createMiddleware(6)],
          "api/v1/status"
        );
      });
    });

    const app = express();
    app.use(getRouter());

    await request(app).get("/api/v1/status");

    expect(executionOrder).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test("should handle middleware execution with parallel routes", async () => {
    scope("api", [createMiddleware(1)], () => {
      // First route
      scope("v1", [createMiddleware(2)], () => {
        get("status", [createMiddleware(3)], "api/v1/status");
      });

      // Parallel route
      scope("v2", [createMiddleware(4)], () => {
        get("status", [createMiddleware(5)], "api/v2/status");
      });
    });

    const app = express();
    app.use(getRouter());

    // Test v1 route
    executionOrder = [];
    await request(app).get("/api/v1/status");
    expect(executionOrder).toEqual([1, 2, 3]);

    // Test v2 route
    executionOrder = [];
    await request(app).get("/api/v2/status");
    expect(executionOrder).toEqual([1, 4, 5]);
  });

  test("should execute error handling middleware in correct order", async () => {
    const errorMiddleware = (num: number) => {
      return (
        err: Error,
        _req: Request,
        _res: Response,
        next: NextFunction
      ) => {
        executionOrder.push(num);
        next(err);
      };
    };

    scope("api", [createMiddleware(1)], () => {
      scope("v1", [createMiddleware(2)], () => {
        get(
          "error",
          [
            createMiddleware(3),
            (_req: Request, _res: Response, next: NextFunction) => {
              next(new Error("Test error"));
            }
          ],
          "api/v1/error"
        );
      });
    });

    const app = express();
    app.use(getRouter());
    app.use(errorMiddleware(4));
    app.use(errorMiddleware(5));
    app.use(
      (_err: Error, _req: Request, res: Response, _next: NextFunction) => {
        res.status(500).json({ error: "Test error" });
      }
    );

    await request(app).get("/api/v1/error").expect(500);

    expect(executionOrder).toEqual([1, 2, 3, 4, 5]);
  });
});
