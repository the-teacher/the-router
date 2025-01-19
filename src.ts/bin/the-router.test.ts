import { sync } from "./the-router";

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
});
