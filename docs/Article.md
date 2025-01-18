# Router for Express.JS Applications

**[@the-teacher/the-router](https://www.npmjs.com/package/@the-teacher/the-router)** — A minimalist yet powerful router for Express.JS applications, inspired by Ruby on Rails and Hanami frameworks.

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
import { root, get, post, scope, resources } from "@the-teacher/the-router";

// Root route
root("index/home");

// Basic routes
get("/about", "pages/about");
post("/contact", "pages/contact");

// Resource routes
resources("posts");

// Scoped routes with middleware
scope("admin", [authenticate], () => {
  resources("users");
  resources("posts");
  get("/stats", "dashboard/stats");
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
  only: ["index", "show", "create"],
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

    const response = await request(app).get("/posts").expect(200);

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

- [NPM Package](https://www.npmjs.com/package/@the-teacher/the-router)
- [GitHub Repository](https://github.com/the-teacher/@the-teacher/the-router)
- [Documentation](https://github.com/the-teacher/@the-teacher/the-router#readme)

## Author

Ilya N. Zykin | [the-teacher](https://github.com/the-teacher)

## Core Concepts

### Action-Based Architecture

Unlike traditional MVC controllers that group related actions together, @the-teacher/the-router follows an action-based approach where each route handler is a separate module. This design:

1. **Single Responsibility**

   - Each action handles one specific HTTP endpoint
   - Clear input/output contract
   - Easy to understand and maintain

2. **Automatic Loading**

   - Actions are loaded based on route definitions
   - Convention over configuration
   - No need for manual controller registration

3. **Predictable Structure**
   ```
   actions/
     posts/
       indexAction.ts  # GET /posts
       showAction.ts   # GET /posts/:id
       createAction.ts # POST /posts
   ```

### Routing Philosophy

The routing system is designed around three key principles:

1. **Declarative Routes**

   ```ts
   // Clear and self-documenting
   root("pages#home");
   get("/about", "pages#about");
   resources("posts");
   ```

2. **Scope-Based Organization**

   ```ts
   // Logical grouping with shared middleware
   scope("admin", [authenticate], () => {
     resources("users");
     get("/stats", "dashboard#stats");
   });
   ```

3. **Convention-Based Mapping**
   - Route `"posts#show"` maps to `actions/posts/showAction.ts`
   - Scope `"admin"` prefixes both URL and action path
   - Resources create standardized RESTful routes

### Middleware Integration

The router provides a flexible middleware system that operates at multiple levels:

1. **Scope-Level Middleware**

   - Applied to all routes within a scope
   - Inherited by nested scopes
   - Perfect for authentication and logging

2. **Resource Middleware**

   - Applied to all actions of a resource
   - Can be combined with scope middleware

   ```ts
   resources("posts", [validatePost]);
   ```

3. **Route-Specific Middleware**
   - Applied to individual routes
   - Highest precedence
   ```ts
   get("/posts/:id", [cacheResponse], "posts/show");
   ```

### Type Safety

The router is built with TypeScript and provides:

1. **Type Definitions**

   - Full typing for route definitions
   - Action parameter typing
   - Middleware typing

2. **Development Benefits**
   - Autocomplete support
   - Compile-time error checking
   - Better refactoring support

### Testing Approach

The router's architecture makes testing straightforward:

1. **Isolated Actions**

   ```ts
   // Easy to test individual actions
   test("should show post", async () => {
     const response = await request(app).get("/posts/1").expect(200);
   });
   ```

2. **Middleware Testing**

   ```ts
   // Easy to test middleware chains
   test("requires auth", async () => {
     await request(app).get("/admin/posts").expect(401);
   });
   ```

3. **Route Organization Testing**
   - Verify scope behavior
   - Test resource routing
   - Validate middleware chains
