import { replacePathParams } from "../../helpers/buildUrlHelpers";

/**
 * Tests for path parameter replacement functionality
 * Verifies:
 * - Single parameter replacement
 * - Multiple parameter replacement
 * - Special character handling in parameters
 * - Multiple occurrences of same parameter
 * - Empty parameter handling
 * - Complex path patterns
 * - URL encoding of parameter values
 */

describe("replacePathParams", () => {
  test("should replace single parameter", () => {
    expect(replacePathParams("/users/:id", { id: "123" })).toBe("/users/123");
  });

  test("should replace multiple parameters", () => {
    expect(
      replacePathParams("/users/:userId/posts/:postId", {
        userId: "123",
        postId: "456"
      })
    ).toBe("/users/123/posts/456");
  });

  test("should handle parameters with special characters", () => {
    expect(
      replacePathParams("/users/:id/profile", {
        id: "user@example.com"
      })
    ).toBe("/users/user%40example.com/profile");
  });

  test("should replace multiple occurrences of the same parameter", () => {
    expect(
      replacePathParams("/users/:id/posts/:id", {
        id: "123"
      })
    ).toBe("/users/123/posts/123");
  });

  test("should handle empty parameters object", () => {
    expect(replacePathParams("/users", {})).toBe("/users");
  });

  test("should handle path with no parameters", () => {
    expect(replacePathParams("/users", { id: "123" })).toBe("/users");
  });

  test("should handle complex paths", () => {
    expect(
      replacePathParams("/api/:version/users/:userId/posts/:postId/comments", {
        version: "v1",
        userId: "user123",
        postId: "post456"
      })
    ).toBe("/api/v1/users/user123/posts/post456/comments");
  });

  test("should encode special characters in parameter values", () => {
    expect(
      replacePathParams("/tags/:tag/items", {
        tag: "web development & design"
      })
    ).toBe("/tags/web%20development%20%26%20design/items");
  });

  test("should handle complex report URL with special characters", () => {
    expect(
      replacePathParams("/reports/:reportId/export/:format", {
        reportId: "report@123",
        format: "csv+json"
      })
    ).toBe("/reports/report%40123/export/csv%2Bjson");
  });

  test("should handle complex item URL with special characters", () => {
    expect(
      replacePathParams("/items/:itemId/tags/:tagId/versions/:versionId", {
        itemId: "item#123",
        tagId: "tag&456",
        versionId: "v1.0"
      })
    ).toBe("/items/item%23123/tags/tag%26456/versions/v1.0");
  });
});
