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

describe("Nested scoped routes", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  beforeEach(() => {
    scope("api", () => {
      get("status", "api/status");

      scope("v1", () => {
        get("users", "api/v1/users/list");
        post("users", "api/v1/users/create");

        scope("admin", () => {
          get("dashboard", "api/v1/admin/dashboard");
          post("settings", "api/v1/admin/settings");
        });
      });

      scope("v2", () => {
        get("users", "api/v2/users/list");
      });
    });
  });

  test("should handle top-level scope route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/api/status");
    expect(response.text).toBe("API Status!");
  });

  test("should handle second-level scope routes", async () => {
    const app = express();
    app.use(getRouter());

    const responseV1 = await request(app).get("/api/v1/users");
    expect(responseV1.text).toBe("V1 Users List!");

    const responseV2 = await request(app).get("/api/v2/users");
    expect(responseV2.text).toBe("V2 Users List!");
  });

  test("should handle deeply nested scope routes", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/api/v1/admin/dashboard");
    expect(response.text).toBe("Admin Dashboard!");
  });

  test("should handle POST requests in nested scopes", async () => {
    const app = express();
    app.use(getRouter());

    const responseUsers = await request(app).post("/api/v1/users");
    expect(responseUsers.text).toBe("Create V1 User!");

    const responseSettings = await request(app).post("/api/v1/admin/settings");
    expect(responseSettings.text).toBe("Update Admin Settings!");
  });

  test("should return 404 for invalid nested routes", async () => {
    const app = express();
    app.use(getRouter());

    const responses = await Promise.all([
      request(app).get("/api/v1/invalid"),
      request(app).get("/api/v1/admin/invalid"),
      request(app).get("/api/v3/users"),
    ]);

    responses.forEach((response) => {
      expect(response.status).toBe(404);
    });
  });
});
