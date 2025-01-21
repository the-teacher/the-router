import path from "path";
import {
  resetRouter,
  setActionsPath,
  get,
  post,
  put,
  patch,
  destroy,
  scope
} from "../index";
import {
  buildUrlHelpers,
  buildRoutesHelpers
} from "../helpers/buildUrlHelpers";
import { type RouteInfo } from "../base";
import { authMiddleware } from "./middlewares";
import fs from "fs";

describe("buildRoutesHelpers", () => {
  const routesDir = path.join(process.cwd(), "routes");
  const helpersPath = path.join(routesDir, "routesHelpers.ts");

  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  test("should generate helpers file with all route helper functions", async () => {
    // Define test routes
    get("/users", "users/index");
    post("/users", "users/create");
    get("/users/:id", "users/show");
    put("/users/:id", "users/update");
    patch("/users/:id/status", "users/update_status");
    destroy("/users/:id", "users/delete");

    scope("admin", [authMiddleware], () => {
      get("dashboard", "admin/dashboard");
      get("users/:userId/posts/:postId", "admin/posts/show");
    });

    await buildRoutesHelpers();

    // Only verify that file exists
    expect(fs.existsSync(helpersPath)).toBe(true);
  });
});

describe("URL Helpers Generator", () => {
  const routesDir = path.join(process.cwd(), "routes");
  const helpersPath = path.join(routesDir, "routesHelpers.ts");

  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  test("should generate working URL helpers for all route types", async () => {
    // Define test routes covering all cases
    get("/", "home/index"); // Root path
    get("/users", "users/index"); // Simple path
    post("/users", "users/create"); // POST method
    get("/users/:id", "users/show"); // Path with parameter
    put("/users/:id", "users/update"); // PUT with _method
    patch("/users/:id/status", "users/update_status"); // PATCH with _method
    destroy("/users/:id", "users/delete"); // DELETE with _method
    get("/posts/:postId/comments/:commentId", "comments/show"); // Multiple parameters

    // Nested routes
    scope("admin", [authMiddleware], () => {
      get("dashboard", "admin/dashboard"); // Scoped route
      get("users/:userId/posts/:postId", "admin/posts/show"); // Scoped with parameters
    });

    await buildRoutesHelpers();

    // Verify file exists and can be imported
    expect(fs.existsSync(helpersPath)).toBe(true);
    const helpers = await import(helpersPath);

    // Test root path
    expect(helpers.home_index_get_path()).toBe("/");
    expect(helpers.home_index_get_path({ page: 1 })).toBe("/?page=1");

    // Test simple path
    expect(helpers.users_index_get_path()).toBe("/users");
    expect(helpers.users_index_get_path({ sort: "name", page: 1 })).toBe(
      "/users?sort=name&page=1"
    );

    // Test POST method
    expect(helpers.users_create_post_path()).toBe("/users");
    expect(helpers.users_create_post_path({ redirect: "dashboard" })).toBe(
      "/users?redirect=dashboard"
    );

    // Test path with parameter
    expect(helpers.users_show_get_path({ id: "123" })).toBe("/users/123");
    expect(helpers.users_show_get_path({ id: "123", format: "json" })).toBe(
      "/users/123?format=json"
    );

    // Test PUT with _method
    expect(helpers.users_update_put_path({ id: "123" })).toBe(
      "/users/123?_method=put"
    );
    expect(helpers.users_update_put_path({ id: "123", version: 2 })).toBe(
      "/users/123?_method=put&version=2"
    );

    // Test PATCH with _method
    expect(helpers.users_update_status_patch_path({ id: "123" })).toBe(
      "/users/123/status?_method=patch"
    );
    expect(
      helpers.users_update_status_patch_path({ id: "123", status: "active" })
    ).toBe("/users/123/status?_method=patch&status=active");

    // Test DELETE with _method
    expect(helpers.users_delete_delete_path({ id: "123" })).toBe(
      "/users/123?_method=delete"
    );

    // Test multiple parameters
    expect(
      helpers.comments_show_get_path({ postId: "1", commentId: "2" })
    ).toBe("/posts/1/comments/2");
    expect(
      helpers.comments_show_get_path({
        postId: "1",
        commentId: "2",
        reply: true
      })
    ).toBe("/posts/1/comments/2?reply=true");

    // Test scoped routes
    expect(helpers.admin_dashboard_get_path()).toBe("/admin/dashboard");
    expect(helpers.admin_dashboard_get_path({ view: "analytics" })).toBe(
      "/admin/dashboard?view=analytics"
    );

    // Test scoped route with parameters
    expect(
      helpers.admin_posts_show_get_path({ userId: "1", postId: "2" })
    ).toBe("/admin/users/1/posts/2");
    expect(
      helpers.admin_posts_show_get_path({
        userId: "1",
        postId: "2",
        draft: true
      })
    ).toBe("/admin/users/1/posts/2?draft=true");
  });
});
