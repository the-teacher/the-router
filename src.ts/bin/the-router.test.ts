/* eslint-disable no-console */
import { sync } from "./the-router";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import crypto from "crypto";

describe("the-router", () => {
  let tempRoutesFile: string;

  // Helper functions
  const generateTempFilePath = () => {
    const randomId = crypto.randomBytes(8).toString("hex");
    return path.join(__dirname, `temp-routes-${randomId}.ts`);
  };

  const createTempRoutesFile = async (content: string) => {
    tempRoutesFile = generateTempFilePath();
    await fs.writeFile(tempRoutesFile, content, "utf8");
    return tempRoutesFile;
  };

  const removeTempRoutesFile = async () => {
    if (tempRoutesFile && existsSync(tempRoutesFile)) {
      await fs.unlink(tempRoutesFile);
    }
  };

  // Mock process.exit to throw an error instead of exiting
  const mockProcessExit = jest
    .spyOn(process, "exit")
    .mockImplementation((code) => {
      throw new Error(`Process.exit called with code ${code}`);
    });

  beforeEach(() => {
    jest.clearAllMocks();
    tempRoutesFile = "";
  });

  afterEach(async () => {
    await removeTempRoutesFile();
  });

  it("should throw error when routes file doesn't exist", async () => {
    await expect(sync({})).rejects.toThrow("Process.exit called with code 1");
    expect(mockProcessExit).toHaveBeenCalledWith(1);

    expect(console.error).toHaveBeenCalledWith(
      "Error:",
      "routesFile parameter is required"
    );
  });

  it("should load and display routes from routes file", async () => {
    const routesContent = `
      import { root, get, post } from "../index";
      
      // Define basic routes
      root("index/index");
      get("/users", "users/list");
      post("/users", "users/create");
      get("/users/:id", "users/show");
    `;
    await createTempRoutesFile(routesContent);

    await sync({ routesFile: tempRoutesFile });

    // Verify console output for each route
    expect(console.log).toHaveBeenCalledWith(
      "Loading routes from:",
      expect.any(String)
    );
    expect(console.log).toHaveBeenCalledWith("\nConfigured Routes:");

    // Verify the formatted route outputs
    expect(console.log).toHaveBeenCalledWith("GET | / | index/index");
    expect(console.log).toHaveBeenCalledWith("GET | /users | users/list");
    expect(console.log).toHaveBeenCalledWith("POST | /users | users/create");
    expect(console.log).toHaveBeenCalledWith("GET | /users/ | users/show");
  });

  it("should handle custom routes configuration", async () => {
    const customRoutesContent = `
      import { root, get, post } from "../index";
      
      root("home/index");
      get("/api/products", "products/list");
      post("/api/orders", "orders/create");
    `;
    await createTempRoutesFile(customRoutesContent);

    await sync({ routesFile: tempRoutesFile });

    expect(console.log).toHaveBeenCalledWith("\nConfigured Routes:");

    expect(console.log).toHaveBeenCalledWith("GET | / | home/index");
    expect(console.log).toHaveBeenCalledWith(
      "GET | /api/products | products/list"
    );
    expect(console.log).toHaveBeenCalledWith(
      "POST | /api/orders | orders/create"
    );
  });

  it("should handle scoped routes configuration", async () => {
    const scopedRoutesContent = `
      import { root, get, post, scope } from "../index";
      
      root("home/index");
      
      // Basic routes
      get("/products", "products/list");
      
      // Admin scope
      scope("admin", () => {
        get("/users", "admin/users/list");
        post("/users", "admin/users/create");
        
        // Nested scope
        scope("reports", () => {
          get("/sales", "admin/reports/sales");
        });
      });
    `;
    await createTempRoutesFile(scopedRoutesContent);

    await sync({ routesFile: tempRoutesFile });

    expect(console.log).toHaveBeenCalledWith("\nConfigured Routes:");
    expect(console.log).toHaveBeenCalledWith("GET | / | home/index");
    expect(console.log).toHaveBeenCalledWith("GET | /products | products/list");
    expect(console.log).toHaveBeenCalledWith(
      "GET | /admin/users | admin/users/list"
    );
    expect(console.log).toHaveBeenCalledWith(
      "POST | /admin/users | admin/users/create"
    );
    expect(console.log).toHaveBeenCalledWith(
      "GET | /admin/reports/sales | admin/reports/sales"
    );
  });

  it("should handle routes with regular expressions", async () => {
    const regExpRoutesContent = `
    import { get } from "../index";
    
    // RegExp routes
    get(/^\\/api\\/v\\d+\\/users$/, "api/users/list");
    get(/.*\\.json$/, "api/json-handler");
    get(/^\\/downloads\\/.*$/, "files/download");
  `;

    await createTempRoutesFile(regExpRoutesContent);
    console.log(tempRoutesFile);

    await sync({ routesFile: tempRoutesFile });

    expect(console.log).toHaveBeenCalledWith(
      "Loading routes from:",
      expect.any(String)
    );

    expect(console.log).toHaveBeenCalledWith("\nConfigured Routes:");

    const expectedRoutes = [
      "GET | /^\\/api\\/v\\d+\\/users$/ | api/users/list",
      "GET | /.*\\.json$/ | api/json-handler",
      "GET | /^\\/downloads\\/.*$/ | files/download"
    ];

    expectedRoutes.forEach((route) => {
      expect(console.log).toHaveBeenCalledWith(route);
    });
  });

  it("should handle complex routing configuration with scopes and RegExp", async () => {
    const complexRoutesContent = `
      import { root, get, post, scope } from "../index";
      
      root("home/index");
      
      // API scope with versioning
      scope("api", () => {
        get(/^v\\d+\\/users$/, "api/users/list");
        
        scope("v1", () => {
          get("/products", "api/v1/products/list");
          post("/orders", "api/v1/orders/create");
        });
        
        scope("v2", () => {
          get("/products", "api/v2/products/list");
          get(/special-\\w+/, "api/v2/special-handler");
        });
      });
    `;
    await createTempRoutesFile(complexRoutesContent);

    await sync({ routesFile: tempRoutesFile });
    expect(console.log).toHaveBeenCalledWith(
      "Loading routes from:",
      expect.any(String)
    );

    expect(console.log).toHaveBeenCalledWith("\nConfigured Routes:");

    const expectedRoutes = [
      "GET | / | home/index",
      "GET | /api/^v\\d+\\/users$/ | api/users/list",

      "GET | /api/v1/products | api/v1/products/list",
      "POST | /api/v1/orders | api/v1/orders/create",

      "GET | /api/v2/products | api/v2/products/list",
      "GET | /api/v2/special-\\w+/ | api/v2/special-handler"
    ];

    expectedRoutes.forEach((route) => {
      expect(console.log).toHaveBeenCalledWith(route);
    });
  });
});
