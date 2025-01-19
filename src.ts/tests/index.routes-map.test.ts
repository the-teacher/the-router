import path from "path";
import {
  root,
  get,
  post,
  setActionsPath,
  resetRouter,
  routeScope as scope,
} from "../index";
import { getRoutesMap } from "../base";

describe("Routes Map", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  test("should maintain basic routes map", () => {
    root("index/index");
    get("/get", "test/get");
    post("/post", "test/post");

    const routes = getRoutesMap();

    expect(routes.size).toBe(3); // root, get, and post routes

    const rootRoute = routes.get("GET:/");
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.action).toBe("index/index");

    const getRoute = routes.get("GET:/get");
    expect(getRoute).toBeDefined();
    expect(getRoute?.action).toBe("test/get");

    const postRoute = routes.get("POST:/post");
    expect(postRoute).toBeDefined();
    expect(postRoute?.action).toBe("test/post");
  });

  test("should handle scoped routes in map", () => {
    scope("admin", () => {
      get("users", "admin/users/index");
      post("users", "admin/users/create");
    });

    const routes = getRoutesMap();
    expect(routes.size).toBe(2);

    const getRoute = routes.get("GET:/admin/users");
    expect(getRoute).toBeDefined();
    expect(getRoute?.action).toBe("admin/users/index");

    const postRoute = routes.get("POST:/admin/users");
    expect(postRoute).toBeDefined();
    expect(postRoute?.action).toBe("admin/users/create");
  });

  test("should not include regexp routes in map", () => {
    get(/.*fly$/, "test/regexp");
    get("/butterfly", "test/butterfly");

    const routes = getRoutesMap();
    expect(routes.size).toBe(1); // Only the string path route should be in the map

    const route = routes.get("GET:/butterfly");
    expect(route).toBeDefined();
    expect(route?.action).toBe("test/butterfly");
  });

  test("should normalize paths in routes map", () => {
    get("users", "users/index"); // without leading slash
    get("/admin", "admin/index"); // with leading slash

    const routes = getRoutesMap();
    expect(routes.size).toBe(2);

    const usersRoute = routes.get("GET:/users");
    expect(usersRoute).toBeDefined();
    expect(usersRoute?.path).toBe("/users");

    const adminRoute = routes.get("GET:/admin");
    expect(adminRoute).toBeDefined();
    expect(adminRoute?.path).toBe("/admin");
  });

  test("should reset routes map when router is reset", () => {
    get("/test", "test/index");
    expect(getRoutesMap().size).toBe(1);

    resetRouter();
    expect(getRoutesMap().size).toBe(0);
  });
});
