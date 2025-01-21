import { buildQueryString } from "../../helpers/buildUrlWithParams";

describe("buildQueryString", () => {
  test("should return empty string for no parameters", () => {
    expect(buildQueryString()).toBe("");
  });

  test("should handle single parameter", () => {
    expect(buildQueryString({ page: 1 })).toBe("?page=1");
  });

  test("should handle multiple parameters", () => {
    expect(buildQueryString({ page: 1, limit: 10 })).toBe("?page=1&limit=10");
  });

  test("should handle boolean parameters", () => {
    expect(buildQueryString({ active: true, deleted: false })).toBe(
      "?active=true&deleted=false"
    );
  });

  test("should handle string parameters", () => {
    expect(buildQueryString({ name: "John", city: "New York" })).toBe(
      "?name=John&city=New+York"
    );
  });

  test("should skip undefined and null values", () => {
    expect(
      buildQueryString({
        name: "John",
        age: undefined,
        city: null,
        active: true
      })
    ).toBe("?name=John&active=true");
  });

  test("should handle method parameter", () => {
    expect(buildQueryString(undefined, "_method=delete")).toBe(
      "?_method=delete"
    );
  });

  test("should combine method parameter with other parameters", () => {
    expect(
      buildQueryString({ force: true, reason: "test" }, "_method=delete")
    ).toBe("?_method=delete&force=true&reason=test");
  });

  test("should handle special characters in values", () => {
    expect(
      buildQueryString({
        query: "hello world",
        tags: "web,development",
        filter: "status=active"
      })
    ).toBe("?query=hello+world&tags=web%2Cdevelopment&filter=status%3Dactive");
  });

  test("should handle empty parameters object", () => {
    expect(buildQueryString({})).toBe("");
  });

  test("should handle numeric values", () => {
    expect(buildQueryString({ page: 1, limit: 10, price: 99.99 })).toBe(
      "?page=1&limit=10&price=99.99"
    );
  });

  test("should handle complex report URL query parameters", () => {
    expect(buildQueryString({ delimiter: ";" })).toBe("?delimiter=%3B");
  });

  test("should handle complex item URL query parameters", () => {
    expect(
      buildQueryString({
        status: "in progress",
        priority: "high!",
        labels: "bug,feature"
      })
    ).toBe("?status=in+progress&priority=high%21&labels=bug%2Cfeature");
  });

  test("should handle complete complex URLs with method parameter", () => {
    // Testing report URL query string
    expect(buildQueryString({ delimiter: ";" }, "_method=get")).toBe(
      "?_method=get&delimiter=%3B"
    );

    // Testing item URL query string
    expect(
      buildQueryString(
        {
          status: "in progress",
          priority: "high!",
          labels: "bug,feature"
        },
        "_method=post"
      )
    ).toBe(
      "?_method=post&status=in+progress&priority=high%21&labels=bug%2Cfeature"
    );
  });
});
