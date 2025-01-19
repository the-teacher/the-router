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
    expect(console.log).toHaveBeenCalledTimes(6);

    expect(console.log).toHaveBeenCalledWith(
      "Loading routes from:",
      expect.any(String)
    );
    expect(console.log).toHaveBeenCalledWith("\nConfigured Routes:");
    expect(console.log).toHaveBeenCalledWith("GET /");
    expect(console.log).toHaveBeenCalledWith("GET /users");
    expect(console.log).toHaveBeenCalledWith("POST /users");
    expect(console.log).toHaveBeenCalledWith("GET /users/:id");
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

    expect(console.log).toHaveBeenCalledWith("GET /");
    expect(console.log).toHaveBeenCalledWith("GET /api/products");
    expect(console.log).toHaveBeenCalledWith("POST /api/orders");
  });
});
