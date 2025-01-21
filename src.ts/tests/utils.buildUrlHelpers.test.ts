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

  test("should generate helper function for simple GET route without params", () => {
    const route: RouteInfo = {
      method: "GET",
      path: "/users",
      action: "users/index",
      middlewares: []
    };

    const result = buildUrlHelpers(route);
    const expectedFn = `export const users_index_get_path = (urlParams?: Record<string, string | number | boolean>): string => {
    const query = [];
    const params = new URLSearchParams();
    Object.entries(urlParams || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`/users\${query.length ? '?' + query.join('&') : ''}\`};`;
    expect(result).toBe(expectedFn);
  });

  test("should generate helper function for route with params and rest parameters", () => {
    const route: RouteInfo = {
      method: "GET",
      path: "/users/:id",
      action: "users/show",
      middlewares: []
    };

    const result = buildUrlHelpers(route);
    const expectedFn = `export const users_show_get_path = ({ id, ...urlParams }: { id: string, [key: string]: string | number | boolean }): string => {
    const query = [];
    const params = new URLSearchParams();
    const { id, ...restParams } = urlParams;
    Object.entries(restParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`/users/\${id}\${query.length ? '?' + query.join('&') : ''}\`};`;
    expect(result).toBe(expectedFn);
  });

  test("should add _method parameter for PUT routes with rest parameters", () => {
    const route: RouteInfo = {
      method: "PUT",
      path: "/users/:id",
      action: "users/update",
      middlewares: []
    };

    const result = buildUrlHelpers(route);
    const expectedFn = `export const users_update_put_path = ({ id, ...urlParams }: { id: string, [key: string]: string | number | boolean }): string => {
    const query = [];
    query.push("_method=put");
    const params = new URLSearchParams();
    const { id, ...restParams } = urlParams;
    Object.entries(restParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`/users/\${id}\${query.length ? '?' + query.join('&') : ''}\`};`;
    expect(result).toBe(expectedFn);
  });

  test("should handle multiple params with rest parameters", () => {
    const route: RouteInfo = {
      method: "PATCH",
      path: "/users/:userId/posts/:postId",
      action: "users/posts/update",
      middlewares: []
    };

    const result = buildUrlHelpers(route);
    const expectedFn = `export const users_posts_update_patch_path = ({ userId, postId, ...urlParams }: { userId: string, postId: string, [key: string]: string | number | boolean }): string => {
    const query = [];
    query.push("_method=patch");
    const params = new URLSearchParams();
    const { userId, postId, ...restParams } = urlParams;
    Object.entries(restParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`/users/\${userId}/posts/\${postId}\${query.length ? '?' + query.join('&') : ''}\`};`;
    expect(result).toBe(expectedFn);
  });
});

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
      "export const users_index_get_path = (urlParams?: Record<string, string | number | boolean>): string =>"
    );
    expect(content).toContain(
      "export const users_create_post_path = (urlParams?: Record<string, string | number | boolean>): string =>"
    );
    expect(content).toContain(
      "export const users_show_get_path = ({ id, ...urlParams }: { id: string, [key: string]: string | number | boolean }): string =>"
    );
    expect(content).toContain(
      "export const users_update_status_patch_path = ({ id, ...urlParams }: { id: string, [key: string]: string | number | boolean }): string =>"
    );
    expect(content).toContain(
      "export const admin_posts_show_get_path = ({ userId, postId, ...urlParams }: { userId: string, postId: string, [key: string]: string | number | boolean }): string =>"
    );

    // Verify _method parameter for non-GET/POST methods
    expect(content).toContain('query.push("_method=put")');
    expect(content).toContain('query.push("_method=patch")');
    expect(content).toContain('query.push("_method=delete")');
  });
});

describe("URL Helpers Generator", () => {
  const routesDir = path.join(process.cwd(), "routes");
  const helpersPath = path.join(routesDir, "routesHelpers.ts");

  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  test("should generate correct URL helpers for all route types", async () => {
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

    // Verify file exists
    expect(fs.existsSync(helpersPath)).toBe(true);

    // Read generated content
    const content = fs.readFileSync(helpersPath, "utf8");

    // Expected content with all helper functions
    const expectedContent = `// This file is auto-generated. Do not edit manually

export const home_index_get_path = (urlParams?: Record<string, string | number | boolean>): string => {
    const query = [];
    const params = new URLSearchParams();
    Object.entries(urlParams || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`/\${query.length ? '?' + query.join('&') : ''}\`};

export const users_index_get_path = (urlParams?: Record<string, string | number | boolean>): string => {
    const query = [];
    const params = new URLSearchParams();
    Object.entries(urlParams || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`/users\${query.length ? '?' + query.join('&') : ''}\`};

export const users_create_post_path = (urlParams?: Record<string, string | number | boolean>): string => {
    const query = [];
    const params = new URLSearchParams();
    Object.entries(urlParams || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`/users\${query.length ? '?' + query.join('&') : ''}\`};

export const users_show_get_path = ({ id, ...urlParams }: { id: string, [key: string]: string | number | boolean }): string => {
    const query = [];
    const params = new URLSearchParams();
    const { id, ...restParams } = urlParams;
    Object.entries(restParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`/users/\${id}\${query.length ? '?' + query.join('&') : ''}\`};

export const users_update_put_path = ({ id, ...urlParams }: { id: string, [key: string]: string | number | boolean }): string => {
    const query = [];
    query.push("_method=put");
    const params = new URLSearchParams();
    const { id, ...restParams } = urlParams;
    Object.entries(restParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`/users/\${id}\${query.length ? '?' + query.join('&') : ''}\`};

export const users_update_status_patch_path = ({ id, ...urlParams }: { id: string, [key: string]: string | number | boolean }): string => {
    const query = [];
    query.push("_method=patch");
    const params = new URLSearchParams();
    const { id, ...restParams } = urlParams;
    Object.entries(restParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`/users/\${id}/status\${query.length ? '?' + query.join('&') : ''}\`};

export const users_delete_delete_path = ({ id, ...urlParams }: { id: string, [key: string]: string | number | boolean }): string => {
    const query = [];
    query.push("_method=delete");
    const params = new URLSearchParams();
    const { id, ...restParams } = urlParams;
    Object.entries(restParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`/users/\${id}\${query.length ? '?' + query.join('&') : ''}\`};

export const comments_show_get_path = ({ postId, commentId, ...urlParams }: { postId: string, commentId: string, [key: string]: string | number | boolean }): string => {
    const query = [];
    const params = new URLSearchParams();
    const { postId, commentId, ...restParams } = urlParams;
    Object.entries(restParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`/posts/\${postId}/comments/\${commentId}\${query.length ? '?' + query.join('&') : ''}\`};

export const admin_dashboard_get_path = (urlParams?: Record<string, string | number | boolean>): string => {
    const query = [];
    const params = new URLSearchParams();
    Object.entries(urlParams || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`/admin/dashboard\${query.length ? '?' + query.join('&') : ''}\`};

export const admin_posts_show_get_path = ({ userId, postId, ...urlParams }: { userId: string, postId: string, [key: string]: string | number | boolean }): string => {
    const query = [];
    const params = new URLSearchParams();
    const { userId, postId, ...restParams } = urlParams;
    Object.entries(restParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`/admin/users/\${userId}/posts/\${postId}\${query.length ? '?' + query.join('&') : ''}\`};`;

    expect(content).toBe(expectedContent);

    // Verify the generated helpers work correctly
    const module = await import(helpersPath);

    // Test simple path
    expect(module.users_index_get_path({ sort: "name", page: 1 })).toBe(
      "/users?sort=name&page=1"
    );

    // Test path with parameter
    expect(module.users_show_get_path({ id: "123", format: "json" })).toBe(
      "/users/123?format=json"
    );

    // Test PUT with _method
    expect(module.users_update_put_path({ id: "123", version: 2 })).toBe(
      "/users/123?_method=put&version=2"
    );

    // Test multiple parameters
    expect(
      module.comments_show_get_path({
        postId: "1",
        commentId: "2",
        reply: true
      })
    ).toBe("/posts/1/comments/2?reply=true");

    // Test scoped route with parameters
    expect(
      module.admin_posts_show_get_path({
        userId: "1",
        postId: "2",
        draft: true
      })
    ).toBe("/admin/users/1/posts/2?draft=true");
  });
});
