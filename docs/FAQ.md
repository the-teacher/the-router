# Frequently Asked Questions

## Why use this router?

Express.js provides a basic router, but its flexibility and lack of predefined application structure often lead to inconsistent solutions across different projects.

This router is a wrapper around the basic Express.js router that:

- Defines a clear project structure
- Makes routing intuitive
- Simplifies code maintenance
- Promotes better business logic organization

## What's common with Ruby on Rails?

The router is inspired by Ruby on Rails' approach to route definition:

```ts
// Rails-like syntax
root("pages/home");
get("/about", "pages/about");
resources("posts");
```

All standard REST actions are supported:

- `index` - list resources
- `show` - view resource
- `new` - creation form
- `create` - create resource
- `edit` - edit form
- `update` - update resource
- `destroy` - delete resource

The `resources` method automatically creates all necessary routes:

```ts
resources("posts");

// Creates routes:
// GET    /posts          -> posts/index
// GET    /posts/new      -> posts/new
// POST   /posts          -> posts/create
// GET    /posts/:id      -> posts/show
// GET    /posts/:id/edit -> posts/edit
// PUT    /posts/:id      -> posts/update
// PATCH  /posts/:id      -> posts/update
// DELETE /posts/:id      -> posts/destroy
```

## What's common with Hanami?

The main similarity with Hanami is the approach to organizing actions. In traditional controllers, code often accumulates, making them difficult to maintain:

```ts
// Traditional controller approach
class PostsController {
  index() {
    /* ... */
  }
  show() {
    /* ... */
  }
  create() {
    /* ... */
  }
  // etc.
}
```

Like Hanami, this router encourages separating actions into individual files:

```
src/
  actions/
    posts/
      indexAction.ts  // Only list posts logic
      showAction.ts   // Only view post logic
      createAction.ts // Only create post logic
```

Each action is a separate module with a single responsibility:

```ts
// src/actions/posts/showAction.ts
export const perform = (req: Request, res: Response) => {
  const { id } = req.params;
  // Logic only for viewing a post
};
```

## How does the router work?

1. Define routes:

```ts
// routes/index.ts
import { root, get, resources } from "@the-teacher/the-router";

root("pages/home");
get("/about", "pages/about");
resources("posts");
```

2. Create actions:

```
src/
  actions/
    pages/
      homeAction.ts
      aboutAction.ts
    posts/
      indexAction.ts
      showAction.ts
      // ...
```

3. Request routing:

```
GET /posts/123 ->
  1. Finds route posts/:id
  2. Determines action posts#show
  3. Executes src/actions/posts/showAction.ts
```

## How to start using the router?

1. Create directory structure:

```
src/
  actions/    # Actions directory
  routes/     # Routes directory
    index.ts  # Route definitions
```

2. Define routes:

```ts
// src/routes/index.ts
import { root, get, resources } from "@the-teacher/the-router";

root("pages/home");
resources("posts");
```

3. Create actions:

```ts
// src/actions/pages/homeAction.ts
export const perform = (req, res) => {
  res.render("home");
};
```

4. Connect the router:

```ts
// src/index.ts
import express from "express";
import { getRouter } from "@the-teacher/the-router";
import "./routes";

const app = express();
app.use(getRouter());

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```

## Additional Features

### Route Grouping

Routes can be grouped using `scope`:

```ts
scope("admin", () => {
  get("/dashboard", "admin/dashboard"); // /admin/dashboard

  resources("posts"); // /admin/posts
  resources("users"); // /admin/users
});
```

### Middleware

Middleware (intermediate software) are functions that execute before request processing by an action. They allow:

- Checking authentication and authorization
- Logging requests
- Error handling
- Modifying request/response objects
- Interrupting the request processing chain

Middleware can be applied to:

- Individual routes
- Route groups via `scope`
- All resource routes

```ts
// Authentication middleware
const authenticate = (req: Request, res: Response, next: Function) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    req.user = verifyToken(token);
    next(); // Continue request processing
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Apply to single route
get("/profile", [authenticate], "users/profile");

// Apply to route group
scope("admin", [authenticate], () => {
  resources("users");
});

// Apply to all resource routes
resources("posts", [authenticate]);
```

If you use multiple middleware, it's recommended to create an array beforehand:

```ts
const permissionsMiddlewares = [authenticate, requireOwner, requireEditorRole];

get("/profile", permissionsMiddlewares, "users/profile");
```

### Regular Expressions

⚠️ **Warning!** This feature is only supported because the original Express.js router is used. The author of this router does not recommend using regular expressions for routes due to their complexity in understanding and maintenance. If you really need to use regular expressions, it's recommended to thoroughly test their behavior.

The router supports all regular expression capabilities available in the original Express.js router:

```ts
// Routes with regular expressions
get(/.*fly$/, "insects#list"); // Matches /butterfly, /dragonfly
get(/^\/api\/v\d+\/.*$/, "api#handle"); // Matches /api/v1/users, /api/v2/posts

// Combining with middleware
get(/^\/secure\/.*$/, [authenticate], "secure#handle");

// Order matters for regular expressions too
get(/^\/api\/v1\/users$/, "users#list"); // Specific route first
get(/^\/api\/v1\/.*$/, "api#handle"); // General route second
```

Regular expressions can be useful for:

- API versioning
- Handling similar URL groups
- Creating flexible routing rules
- Capturing specific URL patterns

## Action Structure

Each action is a module exporting a `perform` function. This function is a standard Express.js handler and accepts the same parameters:

```ts
import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  // req - Express.js request object
  // - req.params - route parameters (/users/:id)
  // - req.query - query parameters (?name=value)
  // - req.body - request body (for POST/PUT/PATCH)
  // - req.headers - request headers

  // res - Express.js response object
  // - res.json() - send JSON
  // - res.send() - send response
  // - res.render() - render template
  // - res.status() - set status

  // Simple action example
  res.json({ message: "Hello!" });
};
```

Examples of typical actions:

Getting resource list:

```ts
// actions/posts/indexAction.ts
export const perform = async (req: Request, res: Response) => {
  const posts = await Post.findAll();
  res.json(posts);
};
```

Viewing single resource:

```ts
// actions/posts/showAction.ts
export const perform = async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.json(post);
};
```

Creating new resource:

```ts
// actions/posts/createAction.ts
export const perform = async (req: Request, res: Response) => {
  const { title, content } = req.body;

  try {
    const post = await Post.create({ title, content });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

## Testing

Actions are easy to test since each action is a separate module with a single function. Jest and SuperTest are used for testing:

```ts
import request from "supertest";
import express from "express";
import { getRouter, setActionsPath } from "@the-teacher/the-router";
import path from "path";

describe("Posts actions", () => {
  let app;

  beforeEach(() => {
    // Create new application for each test
    app = express();

    // Set path to test actions
    setActionsPath(path.join(__dirname, "./test_actions"));

    // Connect router
    app.use(getRouter());
  });

  describe("GET /posts/:id", () => {
    test("returns post by id", async () => {
      // Perform GET request to /posts/123
      const response = await request(app).get("/posts/123").expect(200);

      // Check response
      expect(response.body).toEqual({
        action: "show",
        id: "123",
      });
    });
  });

  describe("POST /posts", () => {
    test("creates new post", async () => {
      const postData = {
        title: "New Post",
        content: "Content",
      };

      // Perform POST request with data
      const response = await request(app)
        .post("/posts")
        .send(postData)
        .expect(200);

      // Check response
      expect(response.body).toEqual({
        action: "create",
        data: postData,
      });
    });
  });
});
```

Test actions can be simple stubs:

```ts
// test_actions/posts/showAction.ts
import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ action: "show", id });
};

// test_actions/posts/createAction.ts
import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  res.json({ action: "create", data: req.body });
};
```

For testing middleware:

```ts
test("requires authentication", async () => {
  const authenticate = (req: any, res: any, next: any) => {
    const auth = req.headers.authorization;
    if (auth === "Bearer valid-token") {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  // Add middleware to route
  get("/profile", [authenticate], "users/profile");

  // Test without token
  await request(app).get("/profile").expect(401);

  // Test with correct token
  await request(app)
    .get("/profile")
    .set("Authorization", "Bearer valid-token")
    .expect(200);
});
```

### Can I use controllers?

The router is specifically designed to work with individual actions. Actions are placed in separate files in corresponding directories. Directories correspond to controllers.

Controllers are used for logical code separation, but not physical separation.

This is done to eliminate reading and understanding sometimes complex logic in controller files, where multiple actions make them difficult to read and understand.

### How to organize reusable logic?

Create common middleware or utilities:

```ts
// middleware/auth.ts
export const authenticate = (req, res, next) => {
  // Common authentication logic
};

// validations/postsValidations.ts
export const validatePost = (data) => {
  // Common validation logic
};
```
