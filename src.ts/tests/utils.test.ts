import path from "path";
import { getRouter } from "../base";
import { loadAction } from "../utils";
import { getActionsPath, setActionsPath, resetRouter } from "../base";

describe("Utils", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  describe("loadAction", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
      resetRouter();
      setActionsPath(path.join(__dirname, "./test_actions"));
    });

    afterEach(() => {
      jest.resetModules();
    });

    test("should load existing action", () => {
      const handler = loadAction("test/get");
      expect(typeof handler).toBe("function");
      expect(console.error).not.toHaveBeenCalled();
    });

    test("should return fallback handler for non-existent action", async () => {
      const handler = loadAction("test/nonExistent");
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await handler(req, res);

      expect(console.error).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("Action file not found:")
      );
      expect(res.status).toHaveBeenCalledWith(501);
      expect(res.json).toHaveBeenCalledWith({
        error: "Not Implemented",
        message: expect.stringContaining("test/nonExistent"),
        details: "The requested action has not been implemented yet",
      });
    });

    test("should throw error when action module doesn't export perform function", () => {
      expect(() => {
        loadAction("test/invalid/noPerform");
      }).toThrow("must export a 'perform' function");
    });

    test("should handle custom actions path", () => {
      const customPath = path.join(__dirname, "custom_actions");
      setActionsPath(customPath);

      const handler = loadAction("test/get");
      expect(typeof handler).toBe("function");
    });

    test("should handle absolute paths", () => {
      const absolutePath = path.join(__dirname, "test_actions", "test", "get");
      const handler = loadAction(absolutePath);
      expect(typeof handler).toBe("function");
    });

    test("should extract correct action name from path", async () => {
      const handler = loadAction("admin/users/list");
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        error: "Not Implemented",
        message: expect.stringContaining("admin/users/list"),
        details: expect.any(String),
      });
    });

    test("should handle empty action path", () => {
      expect(() => {
        loadAction("");
      }).toThrow("Action path cannot be empty");
    });

    test("should handle undefined action path", () => {
      expect(() => {
        // @ts-ignore: testing runtime behavior
        loadAction(undefined);
      }).toThrow("Action path cannot be empty");
    });
  });

  describe("resetRouter", () => {
    test("should reset router and actions path", () => {
      const initialRouter = getRouter();
      const customPath = path.join(__dirname, "custom/path");

      setActionsPath(customPath);
      expect(getActionsPath()).toBe(customPath);

      resetRouter();

      const newRouter = getRouter();
      expect(newRouter).not.toBe(initialRouter);
      expect(getActionsPath()).toBe("src/actions");
    });
  });
});
