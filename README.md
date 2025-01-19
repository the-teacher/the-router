# `The Router`

A simple yet powerful routing solution for `Express.js` applications that provides a clean and intuitive way to organize routes and actions.

## Features

- Simple route definition syntax (similar to Rails framework)
- Action-based approach (similar to Hanami framework)
- Each action in a separate file for better maintainability
- Scoped routes for better organization
- Automatic action loading

## Installation

```bash
npm install @the-teacher/the-router
```

```bash
yarn add @the-teacher/the-router
```

```bash
pnpm add @the-teacher/the-router
```

## Usage

### Basic Routes

`routes/index.ts`

```ts
import { root, get, post, routerScope as scope } from "@the-teacher/the-router";

// Define root route
root("index/index"); // Will use src/actions/index/indexAction.ts

// Define GET and POST routes
get("/users", "users/list"); // Will use src/actions/users/listAction.ts
post("/users", "users/create"); // Will use src/actions/users/createAction.ts

// Define GET and POST routes
scope("admin", () => {
  get("/users", "admin/users/create"); // Will use src/actions/admin/users/createAction.ts
  post("/users", "admin/users/update"); // Will use src/actions/admin/users/updateAction.ts
});
```

### Action Files Structure

Each action is defined in its own file:

```bash
src/
  actions/
    index/
      indexAction.ts    # handles get "/"
    users/
      showAction.ts     # handles get "/users"
      createAction.ts   # handles post "/users"
    admin/
      users/
        createAction.ts   # handles get "/admin/users"
        updateAction.ts   # handles post "/admin/users"
```

Action file example:

```typescript
// src/actions/users/showAction.ts
import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  res.json({ message: "Users list" });
};
```

### Action Files Structure

Each action is defined in its own file and **must export a `perform` function**:

```typescript
// src/actions/users/showAction.ts
import { Request, Response } from "express";

// perform - required method for each action
export const perform = (req: Request, res: Response) => {
  res.json({ message: "Users list" });
};
```

### Scoped Routes

Group related routes under a common prefix:

```ts
scope("admin", () => {
  get("/users", "admin/users/list"); // Will use src/actions/admin/users/listAction.ts
  post("/users", "admin/users/create"); // Will use src/actions/admin/users/createAction.ts
});
```

### Routes with Middleware

You can add middleware to any route:

```ts
import { get, post, routeScope as scope } from "@the-teacher/the-router";

import { authenticate } from "./middlewares/auth";
import { validateUser } from "./middlewares/validation";

// Single middleware
get("/users/:id", [authenticate], "users/show");

// Multiple middleware in execution order
post("/users", [authenticate, validateUser], "users/create");

// Root route with middleware
root([authenticate], "index/index");

// Simple routes without middleware
get("/about", "pages/about");
post("/contact", "pages/contact");

// Middleware with scoped routes
scope("admin", [authenticate], () => {
  // These routes inherit authentication from scope
  get("/users", "users/show");
  post("/users", "users/create");

  // Additional middleware for specific routes
  post("/users/:id", [validateUser], "users/update");
});
```

### Scoped Routes with Middleware

You can add middleware to both individual routes and entire scopes:

```ts
import { authenticate } from "./middlewares/auth";
import { validateUser } from "./middlewares/validation";
import { logRequest } from "./middlewares/logging";

// Apply middleware to all routes within scope
scope("admin", [authenticate], () => {
  // These routes will require authentication
  get("/users", "users/index");
  post("/users", "users/create");

  // This route will require both authentication and validation
  post("/users/:id", [validateUser], "users/update");
});

// Combine multiple middleware for scope
scope("api", [authenticate, logRequest], () => {
  get("/stats", "stats/index");
  get("/health", "health/check");
});

// Simple scope without middleware
scope("public", () => {
  get("/about", "pages/about");
  get("/contact", "pages/contact");
});
```

Middleware specified as the second parameter will be applied to all routes within that scope.

You can still add route-specific middleware that will be executed after the scope middleware.

### Application files structure:

```bash
src/
  index.ts
  routes/
    index.ts
  actions/
    index/
      indexAction.ts
    users/
      showAction.ts
      createAction.ts
      updateAction.ts
    posts/
      showAction.ts
      createAction.ts
    admin/
      users/
        listAction.ts
        createAction.ts
      posts/
        listAction.ts
        updateAction.ts
```

Example of routes matching this structure:

```ts
import { root, get, post, routeScope as scope } from "@the-teacher/the-router";

// Root and basic routes
root("index/index"); // -> src/actions/index/indexAction.ts
get("/users", "users/list"); // -> src/actions/users/listAction.ts
post("/users", "users/create"); // -> src/actions/users/createAction.ts
get("/posts", "posts/show"); // -> src/actions/posts/showAction.ts
post("/posts", "posts/create"); // -> src/actions/posts/createAction.ts

// Admin scope
scope("admin", () => {
  get("/users", "admin/users/list"); // -> src/actions/admin/users/listAction.ts
  post("/users", "admin/users/create"); // -> src/actions/admin/users/createAction.ts
  get("/posts", "admin/posts/list"); // -> src/actions/admin/posts/listAction.ts
  post("/posts", "admin/posts/update"); // -> src/actions/admin/posts/updateAction.ts
});
```

This will create routes:

- GET `/` -> `src/actions/index/indexAction.ts`
- GET `/users` -> `src/actions/users/showAction.ts`
- POST `/users` -> `src/actions/users/createAction.ts`
- GET `/posts` -> `src/actions/posts/showAction.ts`
- POST `/posts` -> `src/actions/posts/createAction.ts`
- GET `/admin/users` -> `src/actions/admin/users/listAction.ts`
- POST `/admin/users` -> `src/actions/admin/users/createAction.ts`
- GET `/admin/posts` -> `src/actions/admin/posts/listAction.ts`
- POST `/admin/posts` -> `src/actions/admin/posts/updateAction.ts`

### Scoped Routes

Group related routes under a common prefix:

```ts
scope("admin", () => {
  get("/users", "admin/users/list"); // -> src/actions/admin/users/listAction.ts
  post("/users", "admin/users/create"); // -> src/actions/admin/users/createAction.ts
});
```

### Routes with Parameters

Routes can include dynamic parameters:

```ts
// Basic parameter routes
get("/users/:id", "users/show"); // -> /users/123
get("/posts/:id/comments", "posts/comments"); // -> /posts/456/comments

// Parameters with middleware
get("/users/:id", [authenticate], "users/show");

// Multiple parameters
get("/posts/:postId/comments/:commentId", "comments/show");
```

### Route Order

The order of route definitions matters. More specific routes should be defined before more general ones:

```ts
// ✅ Correct order
get("/posts/featured", "posts/featured"); // More specific route first
get("/posts/:id", "posts/show"); // General route second

// ❌ Wrong order - "/posts/featured" will never be reached
get("/posts/:id", "posts/show"); // General route catches all
get("/posts/featured", "posts/featured"); // Will never match
```

### Middleware Organization

When using multiple middleware, it's recommended to group them in variables for better maintainability:

```ts
// Group related middleware
const authMiddlewares = [authenticate, checkRole];
const validationMiddlewares = [validateUser, sanitizeInput];

// Use middleware groups in routes
get("/users", authMiddlewares, "users/index");
post("/users", [...authMiddlewares, ...validationMiddlewares], "users/create");

// In scoped routes
const adminMiddlewares = [authenticate, requireAdmin, logAccess];
scope("admin", adminMiddlewares, () => {
  get("/users", "users/list");

  // Additional middleware for specific routes
  const userUpdateMiddlewares = [validateUser];
  post("/users/:id", userUpdateMiddlewares, "users/update");
});
```

### API Reference

Basic usage:

- `root(scopeAction)`: Define root route (`/`)
- `get(path, scopeAction)`: Define GET route
- `post(path, scopeAction)`: Define POST route
- `put(path, scopeAction)`: Define PUT route
- `patch(path, scopeAction)`: Define PATCH route
- `destroy(path, scopeAction)`: Define DELETE route
- `options(path, scopeAction)`: Define OPTIONS route
- `head(path, scopeAction)`: Define HEAD route
- `all(path, scopeAction)`: Define route for all HTTP methods
- `scope(prefix, callback)`: Group routes under a common prefix

With middleware:

- `root(middlewares[], scopeAction)`: Define root route with middleware
- `get(path, middlewares[], scopeAction)`: Define GET route with middleware
- `post(path, middlewares[], scopeAction)`: Define POST route with middleware
- `put(path, middlewares[], scopeAction)`: Define PUT route with middleware
- `patch(path, middlewares[], scopeAction)`: Define PATCH route with middleware
- `destroy(path, middlewares[], scopeAction)`: Define DELETE route with middleware
- `options(path, middlewares[], scopeAction)`: Define OPTIONS route with middleware
- `head(path, middlewares[], scopeAction)`: Define HEAD route with middleware
- `all(path, middlewares[], scopeAction)`: Define route for all HTTP methods with middleware
- `scope(prefix, middlewares[], callback)`: Group routes with middleware

Examples:

```ts
// Basic usage
root("index/index");
get("/users", "users/list");
post("/users", "users/create");
put("/users/:id", "users/update");
patch("/users/:id", "users/patch");
destroy("/users/:id", "users/delete");
options("/users", "users/options");
head("/users", "users/head");
all("/api", "api/handle");
scope("admin", () => {
  /* routes */
});

// With middleware
const authMiddlewares = [authenticate, logRequest];
root([authenticate], "index/index");
get("/users", authMiddlewares, "users/list");
put("/users/:id", authMiddlewares, "users/update");
scope("admin", authMiddlewares, () => {
  /* routes */
});
```

### Routes with Regular Expressions

You can use regular expressions for route paths:

```ts
// Match paths ending with 'fly'
get(/.*fly$/, "insects/list"); // Matches: /butterfly, /dragonfly
get(/^\/api\/v\d+\/.*$/, "api/handle"); // Matches: /api/v1/users, /api/v2/posts

// RegExp routes with middleware
get(/^\/secure\/.*$/, [authenticate], "secure/handle");

// Order matters for RegExp routes too
get(/^\/api\/v1\/users$/, "users/list"); // More specific route first
get(/^\/api\/v1\/.*$/, "api/handle"); // General route second
```

Note: When using regular expressions, the path is passed to `Express.js` as is, without any normalization.

### Resource Routes

Similar to Ruby on Rails, you can define a set of RESTful routes for a resource:

```ts
resources("posts");
```

This will create the following routes:

- `GET /posts` -> `src/actions/posts/indexAction.ts`
- `GET /posts/new` -> `src/actions/posts/newAction.ts`
- `POST /posts` -> `src/actions/posts/createAction.ts`
- `GET /posts/:id` -> `src/actions/posts/showAction.ts`
- `GET /posts/:id/edit` -> `src/actions/posts/editAction.ts`
- `PUT /posts/:id` -> `src/actions/posts/updateAction.ts`
- `PATCH /posts/:id` -> `src/actions/posts/updateAction.ts`
- `DELETE /posts/:id` -> `src/actions/posts/destroyAction.ts`

You can add middleware to all resource routes:

```ts
const postMiddlewares = [authenticate, logRequest];
resources("posts", postMiddlewares);
```

Resources can also be scoped:

```ts
scope("admin", [authenticate], () => {
  resources("posts"); // Routes will be prefixed with /admin
  resources("users"); // Routes will be prefixed with /admin
});
```

This creates routes like `/admin/posts`, `/admin/posts/:id`, etc.

# Resource Options

When defining resources, you can customize which routes are created using `only` or `except` options:

```ts
// Create only index and show routes
resources("posts", { only: ["index", "show"] });

// Create all routes except destroy and edit
resources("posts", { except: ["destroy", "edit"] });

// Combine with middleware
resources("posts", [authenticate], { only: ["show", "update"] });
```

The available actions are:

- `index` - GET /posts
- `new` - GET /posts/new
- `create` - POST /posts
- `show` - GET /posts/:id
- `edit` - GET /posts/:id/edit
- `update` - PUT/PATCH /posts/:id
- `destroy` - DELETE /posts/:id

You can use either `only` or `except`, but not both at the same time. The `only` option takes precedence if both are provided.

### License

MIT.

### Author

Ilya N. Zykin | [the-teacher](https://github.com/the-teacher)
