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
import { buildRoutesHelpers } from "../helpers/buildUrlHelpers";
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

  test("should generate working URL helpers for all route scenarios", async () => {
    // Define routes covering all scenarios
    get("/", "home/index"); // Root path
    get("/users", "users/index"); // Simple path
    post("/users", "users/create"); // Basic POST
    get("/users/:id", "users/show"); // Simple path param
    put("/users/:id", "users/update"); // PUT with method param
    patch("/users/:id/status", "users/update_status"); // PATCH with method param
    destroy("/users/:id", "users/delete"); // DELETE with method param
    get("/posts/:postId/comments/:commentId", "comments/show"); // Multiple params

    // Complex nested routes
    get(
      "/api/v1/organizations/:orgId/projects/:projectId/tasks/:taskId",
      "tasks/show"
    );
    post(
      "/api/v1/organizations/:orgId/invites",
      "organizations/invites/create"
    );
    put(
      "/api/v1/teams/:teamId/members/:userId/role",
      "teams/members/update_role"
    );
    patch(
      "/workspaces/:workspaceId/settings/:settingId",
      "workspaces/settings/update"
    );

    // Routes with special characters
    get("/search/:query/page/:page", "search/results");
    get("/reports/:reportId/export/:format", "reports/export");
    post(
      "/items/:itemId/tags/:tagId/versions/:versionId",
      "items/tags/versions/create"
    );

    // Scoped routes
    scope("admin", [authMiddleware], () => {
      get("dashboard", "admin/dashboard");
      get("users/:userId/posts/:postId", "admin/posts/show");
      patch(
        "organizations/:orgId/settings",
        "admin/organizations/update_settings"
      );
    });

    await buildRoutesHelpers();
    const helpers = await import(helpersPath);

    // Test basic routes
    expect(helpers.home_index_get_path()).toBe("/");
    expect(helpers.home_index_get_path({ page: 1 })).toBe("/?page=1");
    expect(helpers.users_index_get_path({ sort: "name" })).toBe(
      "/users?sort=name"
    );
    expect(helpers.users_create_post_path({ redirect: "dashboard" })).toBe(
      "/users?redirect=dashboard"
    );

    // Test routes with path parameters
    expect(helpers.users_show_get_path({ id: "123" })).toBe("/users/123");
    expect(helpers.users_show_get_path({ id: "123", format: "json" })).toBe(
      "/users/123?format=json"
    );

    // Test routes with method parameters
    expect(helpers.users_update_put_path({ id: "123", version: 2 })).toBe(
      "/users/123?_method=put&version=2"
    );
    expect(
      helpers.users_update_status_patch_path({ id: "123", status: "active" })
    ).toBe("/users/123/status?_method=patch&status=active");
    expect(helpers.users_delete_delete_path({ id: "123", force: true })).toBe(
      "/users/123?_method=delete&force=true"
    );

    // Test deeply nested routes
    expect(
      helpers.tasks_show_get_path({
        orgId: "org_123",
        projectId: "proj_456",
        taskId: "task_789",
        include: "comments",
        version: "2"
      })
    ).toBe(
      "/api/v1/organizations/org_123/projects/proj_456/tasks/task_789?include=comments&version=2"
    );

    // Test routes with various parameter types
    expect(
      helpers.workspaces_settings_update_patch_path({
        workspaceId: "ws_123",
        settingId: "setting_456",
        enabled: true,
        threshold: 42,
        notify: false
      })
    ).toBe(
      "/workspaces/ws_123/settings/setting_456?_method=patch&enabled=true&threshold=42&notify=false"
    );

    // Test special characters handling
    expect(
      helpers.reports_export_get_path({
        reportId: "report@123",
        format: "csv+json",
        delimiter: ";"
      })
    ).toBe("/reports/report%40123/export/csv%2Bjson?delimiter=%3B");

    expect(
      helpers.items_tags_versions_create_post_path({
        itemId: "item#123",
        tagId: "tag&456",
        versionId: "v1.0",
        status: "in progress",
        priority: "high!",
        labels: "bug,feature"
      })
    ).toBe(
      "/items/item%23123/tags/tag%26456/versions/v1.0?status=in+progress&priority=high%21&labels=bug%2Cfeature"
    );

    // Test scoped routes
    expect(helpers.admin_dashboard_get_path({ view: "analytics" })).toBe(
      "/admin/dashboard?view=analytics"
    );

    expect(
      helpers.admin_posts_show_get_path({
        userId: "user_1",
        postId: "post_2",
        draft: true
      })
    ).toBe("/admin/users/user_1/posts/post_2?draft=true");

    expect(
      helpers.admin_organizations_update_settings_patch_path({
        orgId: "org_789",
        theme: "dark",
        notifications: true
      })
    ).toBe(
      "/admin/organizations/org_789/settings?_method=patch&theme=dark&notifications=true"
    );
  });
});
