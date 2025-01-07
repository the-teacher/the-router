import path from "path";
import express from "express";
import request from "supertest";
import { Request, Response, NextFunction } from "express";

import {
  root,
  get,
  post,
  put,
  patch,
  destroy,
  options,
  head,
  all,
  resources,
  getRouter,
  setActionsPath,
  resetRouter,
  routeScope as scope,
  setRouterOptions,
} from "../index";

describe("Routes", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  describe("Basic routes", () => {
    beforeEach(() => {
      root("index#index");
      get("/get", "test#get");
      post("/post", "test#post");
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

  describe("Scoped routes", () => {
    beforeEach(() => {
      scope("admin", () => {
        get("show", "admin#show");
        post("update", "admin#update");
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

  describe("Routes with parameters", () => {
    beforeEach(() => {
      resetRouter();
      setActionsPath(path.join(__dirname, "./test_actions"));

      get("/users/:id", "test#getUser");
      post("/users/:id", "test#updateUser");
    });

    test("should handle route parameters in GET request", async () => {
      const app = express();
      app.use(getRouter());

      const response = await request(app).get("/users/123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: "123",
        message: "Get user 123",
      });
    });

    test("should handle route parameters and body in POST request", async () => {
      const app = express();
      app.use(express.json());
      app.use(getRouter());

      const userData = {
        name: "John Doe",
        email: "john@example.com",
      };

      const response = await request(app).post("/users/123").send(userData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: "123",
        name: "John Doe",
        email: "john@example.com",
        message: "User 123 updated",
      });
    });
  });

  describe("HTTP Methods", () => {
    test("should handle PUT requests", async () => {
      put("/users/1", "users#update");

      const app = express();
      app.use(getRouter());

      const response = await request(app).put("/users/1");
      expect(response.status).toBe(200);
    });

    test("should handle PATCH requests", async () => {
      patch("/users/1", "users#patch");

      const app = express();
      app.use(getRouter());

      const response = await request(app).patch("/users/1");
      expect(response.status).toBe(200);
    });

    test("should handle DELETE requests", async () => {
      destroy("/users/1", "users#delete");

      const app = express();
      app.use(getRouter());

      const response = await request(app).delete("/users/1");
      expect(response.status).toBe(200);
    });

    test("should handle OPTIONS requests", async () => {
      options("/users", "users#options");

      const app = express();
      app.use(getRouter());

      const response = await request(app).options("/users");
      expect(response.status).toBe(200);
    });

    test("should handle HEAD requests", async () => {
      head("/users", "users#head");

      const app = express();
      app.use(getRouter());

      const response = await request(app).head("/users");
      expect(response.status).toBe(200);
    });

    test("should handle ALL method", async () => {
      all("/api", "api#handle");

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
      const authenticate = (req: any, res: any, next: any) => {
        const auth = req.headers.authorization;
        if (auth === "Bearer valid-token") {
          next();
        } else {
          res.status(401).json({ error: "Unauthorized" });
        }
      };

      put("/users/1", [authenticate], "users#update");
      patch("/users/1", [authenticate], "users#patch");
      destroy("/users/1", [authenticate], "users#delete");

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

  describe("Routes with RegExp", () => {
    beforeEach(() => {
      resetRouter();
      setActionsPath(path.join(__dirname, "./test_actions"));
    });

    test("should handle routes with RegExp patterns", async () => {
      get(/.*fly$/, "test#regexp");

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
      const authenticate = (req: any, res: any, next: any) => {
        const auth = req.headers.authorization;
        if (auth === "Bearer valid-token") {
          next();
        } else {
          res.status(401).json({ error: "Unauthorized" });
        }
      };

      get(/^\/secure\/.*$/, [authenticate], "test#regexp");

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
      get(/^\/api\/v1\/.*$/, "test#regexp"); // Matches all /api/v1/ paths
      get(/^\/api\/v1\/users$/, "test#regexp"); // Should never match due to order

      const app = express();
      app.use(getRouter());

      const response = await request(app).get("/api/v1/users");
      expect(response.status).toBe(200);
      expect(response.body.path).toBe("/api/v1/users");
      expect(response.body.message).toBe("Handled by first route");
    });
  });

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

      scope("admin", () => {
        resources("posts");
      });

      const authenticate = (req: any, res: any, next: any) => {
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
      const authenticate = (
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        const token = req.headers["authorization"];
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

      // With strict routing, trailing slashes matter
      const response1 = await request(app).get("/posts").expect(200);
      const response2 = await request(app).get("/posts/").expect(404);
      expect(response1.body).toEqual({ action: "index" });
    });

    test("should respect case sensitive routing option", async () => {
      setActionsPath(path.join(__dirname, "./test_actions"));
      setRouterOptions({ caseSensitive: true });
      resources("posts");
      const app = express();
      app.use(getRouter());

      // With case sensitive routing, case matters
      const response1 = await request(app).get("/posts").expect(200);
      const response2 = await request(app).get("/POSTS").expect(404);
      expect(response1.body).toEqual({ action: "index" });
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

  describe("Missing Action Tests", () => {
    test("should throw error when action file does not exist", () => {
      expect(() => {
        root("non_existent#index");
      }).toThrow(/Cannot find module.*non_existent\/indexAction/);
    });

    test("should throw error with correct path when action missing in scope", () => {
      expect(() => {
        scope("admin", () => {
          get("/users", "missing#list");
        });
      }).toThrow(/Cannot find module '.*\/missing\/listAction'/);
    });
  });
});
