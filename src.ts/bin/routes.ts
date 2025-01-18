import { root, get, post } from "../index";

// Определяем простые маршруты
root("index/index");
get("/users", "users/list");
post("/users", "users/create");
get("/users/:id", "users/show");
