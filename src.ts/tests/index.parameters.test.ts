import path from "path";
import express from "express";
import request from "supertest";
import { getRouter, setActionsPath, resetRouter, get, post } from "../index";

describe("Routes with parameters", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath(path.join(__dirname, "./test_actions"));

    get("/users/:id", "users/get");
    post("/users/:id", "users/update");
  });

  test("should handle route parameters in GET request", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app).get("/users/123");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "123",
      message: "Get user 123"
    });
  });

  test("should handle route parameters and body in POST request", async () => {
    const app = express();
    app.use(express.json());
    app.use(getRouter());

    const userData = {
      name: "John Doe",
      email: "john@example.com"
    };

    const response = await request(app).post("/users/123").send(userData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "123",
      name: "John Doe",
      email: "john@example.com",
      message: "User 123 updated"
    });
  });
});
