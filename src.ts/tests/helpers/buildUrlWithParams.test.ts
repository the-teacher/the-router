import { buildUrlWithParams } from "../../helpers/buildUrlHelpers";

/**
 * Tests for URL construction with parameters
 * Verifies:
 * - Basic URL construction
 * - Path parameter replacement
 * - Query parameter addition
 * - Method parameter handling
 * - Parameter combination handling
 * - Special character encoding in URLs
 * - Complex URL pattern handling
 */

describe("buildUrlWithParams", () => {
  test("should build basic URL without parameters", () => {
    const url = buildUrlWithParams("/users");
    expect(url).toBe("/users");
  });

  test("should handle path parameters", () => {
    const url = buildUrlWithParams("/users/123", { id: "123" });
    expect(url).toBe("/users/123");
  });

  test("should add query parameters", () => {
    const url = buildUrlWithParams("/users", undefined, { page: 1, limit: 10 });
    expect(url).toBe("/users?page=1&limit=10");
  });

  test("should handle method parameter", () => {
    const url = buildUrlWithParams(
      "/users/123",
      { id: "123" },
      undefined,
      "_method=delete"
    );
    expect(url).toBe("/users/123?_method=delete");
  });

  test("should combine method and query parameters", () => {
    const url = buildUrlWithParams(
      "/users/123",
      { id: "123" },
      { force: true },
      "_method=delete"
    );
    expect(url).toBe("/users/123?_method=delete&force=true");
  });

  test("should handle boolean and number query parameters", () => {
    const url = buildUrlWithParams("/search", undefined, {
      active: true,
      count: 5,
      verified: false
    });
    expect(url).toBe("/search?active=true&count=5&verified=false");
  });

  test("should skip undefined and null query parameters", () => {
    const url = buildUrlWithParams("/users", undefined, {
      name: "John",
      age: undefined,
      city: null,
      active: true
    });
    expect(url).toBe("/users?name=John&active=true");
  });

  test("should handle empty query parameters", () => {
    const url = buildUrlWithParams("/users", undefined, {});
    expect(url).toBe("/users");
  });

  test("should handle query parameters with special characters", () => {
    const url = buildUrlWithParams("/search", undefined, {
      query: "hello world",
      tag: "#coding"
    });
    expect(url).toBe("/search?query=hello+world&tag=%23coding");
  });

  test("should replace path parameters in template", () => {
    const url = buildUrlWithParams("/users/:id/posts/:postId", {
      id: "123",
      postId: "456"
    });
    expect(url).toBe("/users/123/posts/456");
  });

  test("should handle path parameters with query params", () => {
    const url = buildUrlWithParams(
      "/users/:id/posts/:postId",
      { id: "123", postId: "456" },
      { sort: "desc" }
    );
    expect(url).toBe("/users/123/posts/456?sort=desc");
  });
});
