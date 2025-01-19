import { root, get, post } from "../index";

// Define basic routes
root("index/index");
get("/users", "users/list");
post("/users", "users/create");
get("/users/:id", "users/show");
