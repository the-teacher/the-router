import fs from "fs";
import path from "path";
import { resetRouter, setActionsPath, root, get, post, scope } from "../index";
import { buildRoutesSchema } from "../utils";
import { authMiddleware, addDataMiddleware } from "./middlewares";

describe("buildRoutesSchema", () => {
  const schemaDir = path.join(process.cwd(), "routes");
  const schemaPath = path.join(schemaDir, "routesSchema.md");

  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
    // Clean up test files if they exist
    if (fs.existsSync(schemaPath)) {
      fs.unlinkSync(schemaPath);
    }
    if (fs.existsSync(schemaDir)) {
      fs.rmdirSync(schemaDir);
    }
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(schemaPath)) {
      fs.unlinkSync(schemaPath);
    }
    if (fs.existsSync(schemaDir)) {
      fs.rmdirSync(schemaDir);
    }
  });

  test("should generate routes schema markdown file with complex routing", async () => {
    // Root route with middleware
    root([addDataMiddleware], "index/index");

    // Basic routes
    get("/users", "users/index");
    post("/users", [authMiddleware], "users/create");
    get("/users/:id", "users/show");

    // Admin scope with middleware
    scope("admin", [authMiddleware], () => {
      get("dashboard", "admin/dashboard");
      post("settings", "admin/settings");
    });

    // API scope with nested scopes
    scope("api", [authMiddleware], () => {
      get("status", "api/status");

      scope("v1", () => {
        get("users", "api/v1/users/list");
        post("users", "api/v1/users/create");

        scope("admin", [authMiddleware], () => {
          get("dashboard", [addDataMiddleware], "api/v1/admin/dashboard");
          post("settings", "api/v1/admin/settings");
        });
      });

      scope("v2", () => {
        get("users", "api/v2/users/list");
      });
    });

    await buildRoutesSchema();

    // Verify file exists
    expect(fs.existsSync(schemaPath)).toBe(true);

    // Verify content
    const content = fs.readFileSync(schemaPath, "utf8");

    // Table header
    expect(content).toContain("| Method | Path | Action | Middlewares |");

    // Root route
    expect(content).toContain("| GET | / | index/index | 1 middleware(s) |");

    // Basic routes
    expect(content).toContain("| GET | /users | users/index | none |");
    expect(content).toContain(
      "| POST | /users | users/create | 1 middleware(s) |"
    );
    expect(content).toContain("| GET | /users/:id | users/show | none |");

    // Admin routes with middleware
    expect(content).toContain(
      "| GET | /admin/dashboard | admin/dashboard | 1 middleware(s) |"
    );
    expect(content).toContain(
      "| POST | /admin/settings | admin/settings | 1 middleware(s) |"
    );

    // API routes
    expect(content).toContain(
      "| GET | /api/status | api/status | 1 middleware(s) |"
    );
    expect(content).toContain(
      "| GET | /api/v1/users | api/v1/users/list | 1 middleware(s) |"
    );
    expect(content).toContain(
      "| POST | /api/v1/users | api/v1/users/create | 1 middleware(s) |"
    );
    expect(content).toContain(
      "| GET | /api/v1/admin/dashboard | api/v1/admin/dashboard | 3 middleware(s) |"
    );
    expect(content).toContain(
      "| POST | /api/v1/admin/settings | api/v1/admin/settings | 2 middleware(s) |"
    );
    expect(content).toContain(
      "| GET | /api/v2/users | api/v2/users/list | 1 middleware(s) |"
    );
  });
});
