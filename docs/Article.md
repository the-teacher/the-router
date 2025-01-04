# Router for Express.JS Applications

**[the-router](https://www.npmjs.com/package/the-router)** — A minimalist yet powerful router for Express.JS applications, inspired by Ruby on Rails and Hanami frameworks.

![Router Architecture](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/p5t1zaooq2323t3sxf37.png)

## Key Features

- Rails-like routing syntax
- Action-based approach (inspired by Hanami)
- Automatic action loading
- Middleware support at multiple levels
- Resource routing
- Scoped routes
- Regular expression support
- TypeScript support
- Comprehensive testing suite

## Basic Usage

```ts
// routes/index.ts
import { root, get, post, scope, resources } from "the-router";

// Root route
root("index#home");

// Basic routes
get("/about", "pages#about");
post("/contact", "pages#contact");

// Resource routes
resources("posts");

// Scoped routes with middleware
scope("admin", [authenticate], () => {
  resources("users");
  resources("posts");
});
```

## Project Structure

```bash
src/
  actions/           # Action files
    index/
      homeAction.ts  # Handles root route
    pages/
      aboutAction.ts # Handles GET /about
    posts/          # Resource actions
      indexAction.ts
      showAction.ts
      createAction.ts
      # ...
  routes/
    index.ts        # Route definitions
```

## Action Files

Each route maps to a dedicated action file:

```ts
// src/actions/posts/showAction.ts
import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  const { id } = req.params;
  // Logic for showing a post
  res.json({ post: { id, title: "Sample Post" } });
};
```

## Advanced Features

### Resource Routing

```ts
resources("posts", [authenticate], {
  only: ["index", "show", "create"]
});
```

Creates:
- GET /posts
- GET /posts/:id
- POST /posts

### Middleware Support

```ts
// Global middleware for scope
scope("admin", [authenticate, logRequest], () => {
  // Route-specific middleware
  get("/stats", [validateAccess], "admin#stats");
  resources("users");
});
```

### Regular Expression Routes

```ts
// API versioning
get(/^\/api\/v\d+\/users$/, "api#users");

// Flexible patterns
get(/.*fly$/, "insects#list"); // Matches: butterfly, dragonfly
```

## Testing

The router includes a comprehensive testing suite:

```ts
describe("Resource Routes", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath("./test_actions");
    resources("posts");
  });

  test("should handle index route", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app)
      .get("/posts")
      .expect(200);
      
    expect(response.body.action).toBe("index");
  });
});
```

## Benefits

1. **Clean Code Organization**
   - Each action in its own file
   - Clear separation of concerns
   - Easy to maintain and test

2. **Flexible Routing**
   - Support for all HTTP methods
   - Regular expression patterns
   - Resource routing
   - Nested scopes

3. **Middleware Integration**
   - Multiple levels of middleware
   - Scope-wide middleware
   - Route-specific middleware
   - Resource middleware

4. **TypeScript Support**
   - Full type definitions
   - Enhanced IDE support
   - Better error catching

## Conclusion

The Router provides a robust, Rails-inspired routing solution for Express.js applications while maintaining simplicity and flexibility. It's particularly well-suited for:

- REST APIs
- Full-stack applications
- Microservices
- Enterprise applications

The combination of clean code organization, powerful features, and comprehensive testing makes it a reliable choice for Express.js routing.

## Links

- [NPM Package](https://www.npmjs.com/package/the-router)
- [GitHub Repository](https://github.com/the-teacher/the-router)
- [Documentation](https://github.com/the-teacher/the-router#readme)

## Author

Ilya N. Zykin | [the-teacher](https://github.com/the-teacher)
