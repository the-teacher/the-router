import path from "path";
import { getRouter } from "../base";
import { loadAction } from "../utils";
import { getActionsPath, setActionsPath, resetRouter } from "../base";
import { Request, Response } from "express";

describe("Utils", () => {
  // Create a mock Request object
  const createMockRequest = (): Partial<Request> => ({
    get: jest.fn(),
    header: jest.fn(),
    accepts: jest.fn(),
    acceptsCharsets: jest.fn(),
    acceptsEncodings: jest.fn(),
    acceptsLanguages: jest.fn(),
    param: jest.fn(),
    is: jest.fn()
  });

  // Create a mock Response object
  const createMockResponse = (): Partial<Response> => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
    sendStatus: jest.fn(),
    links: jest.fn(),
    jsonp: jest.fn(),
    sendFile: jest.fn(),
    download: jest.fn(),
    redirect: jest.fn(),
    render: jest.fn(),
    locals: {},
    charset: "",
    headersSent: false
  });

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

    test("should return error handler for non-existent action", async () => {
      const handler = loadAction("test/nonExistent");
      const req = createMockRequest();
      const res = createMockResponse();

      await handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(501);
      expect(res.json).toHaveBeenCalledWith({
        error: "Action loading failed",
        message: "Failed to load the specified action",
        details: expect.stringContaining("Action file")
      });
    });

    test("should return error handler when action module doesn't export perform function", async () => {
      const handler = loadAction("test/invalid/noPerform");
      const req = createMockRequest();
      const res = createMockResponse();

      await handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(501);
      expect(res.json).toHaveBeenCalledWith({
        error: "Action loading failed",
        message: "Failed to load the specified action",
        details: expect.stringContaining("must export a 'perform' function")
      });
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

    test("should return error handler for empty action path", async () => {
      const handler = loadAction("");
      const req = createMockRequest();
      const res = createMockResponse();

      await handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(501);
      expect(res.json).toHaveBeenCalledWith({
        error: "Action loading failed",
        message: "Failed to load the specified action",
        details: "Action path cannot be empty"
      });
    });

    test("should return error handler for undefined action path", async () => {
      const handler = loadAction(undefined as unknown as string);
      const req = createMockRequest();
      const res = createMockResponse();

      await handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(501);
      expect(res.json).toHaveBeenCalledWith({
        error: "Action loading failed",
        message: "Failed to load the specified action",
        details: "Action path cannot be empty"
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
