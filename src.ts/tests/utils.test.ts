import path from "path";
import { getRouter } from "../base";
import { parseScopeActionString, buildActionPath, loadAction } from "../utils";
import {
  getActionsPath,
  setActionsPath,
  resetRouter,
  setRouterScope,
} from "../base";

describe("Utils", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  describe("parseScopeActionString", () => {
    test("should correctly parse scope and action", () => {
      const result = parseScopeActionString("users#show");
      expect(result).toEqual({ scope: "users", action: "show" });
    });

    test("should throw an error for an invalid format (missing action)", () => {
      expect(() => {
        parseScopeActionString("user#");
      }).toThrow(
        "Invalid format for scope action: user#. Expected format is 'scope#action'."
      );
    });

    test("should throw an error for an invalid format (missing controller)", () => {
      const input = "#create";

      expect(() => {
        parseScopeActionString(input);
      }).toThrow(
        "Invalid format for scope action: #create. Expected format is 'scope#action'."
      );
    });

    test("should throw an error for an empty string", () => {
      const input = "";

      expect(() => {
        parseScopeActionString(input);
      }).toThrow(
        "Invalid format for scope action: . Expected format is 'scope#action'."
      );
    });

    test('should throw an error for a string without a "#" separator', () => {
      const input = "usercreate";

      expect(() => {
        parseScopeActionString(input);
      }).toThrow(
        "Invalid format for scope action: usercreate. Expected format is 'scope#action'."
      );
    });
  });

  describe("buildActionPath", () => {
    test("should build correct path without scope", () => {
      const result = buildActionPath("users", "show");
      expect(result).toContain("/test_actions/users/showAction");
    });
  });

  describe("loadAction", () => {
    test("should load existing action", () => {
      const scopeName = "test";
      const action = "get";

      const actionPath = buildActionPath(scopeName, action);
      const handler = loadAction(actionPath);
      expect(typeof handler).toBe("function");
    });

    test("should return fallback handler for non-existent action", async () => {
      const scopeName = "test";
      const action = "nonExistent";

      const actionPath = buildActionPath(scopeName, action);
      const handler = loadAction(actionPath);

      // Create mocks for req and res
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the handler
      await handler(req, res);

      // Verify that response was sent with 501 status code
      expect(res.status).toHaveBeenCalledWith(501);
      expect(res.json).toHaveBeenCalledWith({
        error: "Not Implemented",
        message: expect.stringContaining("nonExistentAction"),
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
