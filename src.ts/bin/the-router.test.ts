/* eslint-disable no-console */
import { sync } from "./the-router";
import path from "path";

describe("the-router", () => {
  // Mock process.exit to throw an error instead of exiting
  const mockProcessExit = jest
    .spyOn(process, "exit")
    .mockImplementation((code) => {
      throw new Error(`Process.exit called with code ${code}`);
    });

  beforeEach(() => {
    jest.clearAllMocks();
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
    const routesFile = path.join(__dirname, "routes");

    await sync({ routesFile });

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
});
