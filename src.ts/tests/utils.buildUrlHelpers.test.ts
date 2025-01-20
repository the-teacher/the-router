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

describe("buildUrlHelpers", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  test("should generate helper function for simple route without params", () => {
    const route: RouteInfo = {
      method: "GET",
      path: "/users",
      action: "users/index",
      middlewares: []
    };

    const result = buildUrlHelpers(route);
    expect(result).toBe(
      "export const users_index_get_path = (): string => `/users`;"
    );
  });

  test("should generate helper function for route with params", () => {
    const route: RouteInfo = {
      method: "GET",
      path: "/users/:id",
      action: "users/show",
      middlewares: []
    };

    const result = buildUrlHelpers(route);
    expect(result).toBe(
      "export const users_show_get_path = ({ id }: Record<string, string>): string => `/users/${id}`;"
    );
  });

  test("should generate helper function for route with multiple params", () => {
    const route: RouteInfo = {
      method: "PUT",
      path: "/users/:userId/posts/:postId",
      action: "users/posts/update",
      middlewares: []
    };

    const result = buildUrlHelpers(route);
    expect(result).toBe(
      "export const users_posts_update_put_path = ({ userId, postId }: Record<string, string>): string => `/users/${userId}/posts/${postId}`;"
    );
  });

  test("should add _method=patch query parameter for PATCH routes", () => {
    const route: RouteInfo = {
      method: "PATCH",
      path: "/users/:id/status",
      action: "users/update_status",
      middlewares: []
    };

    const result = buildUrlHelpers(route);
    expect(result).toBe(
      "export const users_update_status_patch_path = ({ id }: Record<string, string>): string => `/users/${id}/status?_method=patch`;"
    );
  });
});

describe("buildRoutesHelpers", () => {
  const routesDir = path.join(process.cwd(), "routes");
  const helpersPath = path.join(routesDir, "routesHelpers.ts");

  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
    // Clean up test file if it exists
    // if (fs.existsSync(helpersPath)) {
    //   fs.unlinkSync(helpersPath);
    // }
  });

  afterEach(() => {
    // Clean up test file
    // if (fs.existsSync(helpersPath)) {
    //   fs.unlinkSync(helpersPath);
    // }
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

    // Verify file exists
    expect(fs.existsSync(helpersPath)).toBe(true);

    // Read and verify content
    const content = fs.readFileSync(helpersPath, "utf8");

    // Verify auto-generated comment
    expect(content).toContain(
      "// This file is auto-generated. Do not edit manually"
    );

    // Verify generated helpers
    expect(content).toContain(
      "export const users_index_get_path = (): string => `/users`;"
    );
    expect(content).toContain(
      "export const users_create_post_path = (): string => `/users`;"
    );
    expect(content).toContain(
      "export const users_show_get_path = ({ id }: Record<string, string>): string => `/users/${id}`;"
    );
    expect(content).toContain(
      "export const users_update_status_patch_path = ({ id }: Record<string, string>): string => `/users/${id}/status?_method=patch`;"
    );
    expect(content).toContain(
      "export const admin_posts_show_get_path = ({ userId, postId }: Record<string, string>): string => `/admin/users/${userId}/posts/${postId}`;"
    );
  });
});
