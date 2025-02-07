import { encodePathParam } from "../../helpers/buildUrlHelpers";

describe("encodePathParam", () => {
  test("should encode basic string", () => {
    expect(encodePathParam("hello")).toBe("hello");
  });

  test("should handle path segments", () => {
    expect(encodePathParam("path/to/resource")).toBe("path/to/resource");
  });

  test("should encode special characters", () => {
    expect(encodePathParam("hello!world")).toBe("hello%21world");
    expect(encodePathParam("test(param)")).toBe("test%28param%29");
    expect(encodePathParam("item*star")).toBe("item%2Astar");
  });

  test("should encode multiple special characters", () => {
    expect(encodePathParam("test!()*")).toBe("test%21%28%29%2A");
  });

  test("should handle spaces", () => {
    expect(encodePathParam("hello world")).toBe("hello%20world");
  });

  test("should handle URL-unsafe characters", () => {
    expect(encodePathParam("user@example.com")).toBe("user%40example.com");
    expect(encodePathParam("tag#topic")).toBe("tag%23topic");
  });

  test("should handle empty string", () => {
    expect(encodePathParam("")).toBe("");
  });

  test("should handle non-string input by converting to string", () => {
    expect(encodePathParam("123")).toBe("123");
  });

  test("should handle complex URL-unsafe characters in report paths", () => {
    expect(encodePathParam("report@123")).toBe("report%40123");
    expect(encodePathParam("csv+json")).toBe("csv%2Bjson");
  });

  test("should handle complex URL-unsafe characters in item paths", () => {
    expect(encodePathParam("item#123")).toBe("item%23123");
    expect(encodePathParam("tag&456")).toBe("tag%26456");
    expect(encodePathParam("v1.0")).toBe("v1.0");
  });
});
