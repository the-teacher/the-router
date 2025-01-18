import path from "path";
import { getRouter } from "../base";
import { normalizeActionPath, loadAction } from "../utils";
import { getActionsPath, setActionsPath, resetRouter } from "../base";

describe("Utils", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  describe("normalizeActionPath", () => {
    test("should normalize action path", () => {
      const result = normalizeActionPath("users/show");
      expect(result).toBe("users/show");
    });

    test("should throw error for empty path", () => {
      expect(() => {
        normalizeActionPath("");
      }).toThrow("Action path cannot be empty");
    });
  });

  describe("loadAction", () => {
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
      expect(console.error).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("Please create action file")
      );

      expect(res.status).toHaveBeenCalledWith(501);
      expect(res.json).toHaveBeenCalledWith({
        error: "Not Implemented",
        message: expect.stringContaining("test/nonExistent"),
        details: "The requested action has not been implemented yet",
      });
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
