import path from "path";
import express from "express";
import request from "supertest";
import {
  root,
  get,
  post,
  getRouter,
  setActionsPath,
  resetRouter,
} from "../index";
import { getRoutesMap } from "../base";

describe("Basic routes", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));
  });

  beforeEach(() => {
    root("index/index");
    get("/get", "test/get");
    post("/post", "test/post");
  });

  test("should return the correct response for the root route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/");
    expect(response.text).toBe("Hello Index!");
  });

  test("should return the correct response for the GET route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/get");
    expect(response.text).toBe("Hello Get!");
  });

  test("should return the correct response for the POST route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).post("/post");
    expect(response.text).toBe("Hello Post!");
  });

  test("should maintain routes map", async () => {
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
});
