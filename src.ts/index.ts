import { RequestHandler } from "express";

import {
  getRouter,
  getActionsPath,
  setActionsPath,
  resetRouter,
  routeScope,
  getScopeMiddlewares,
  setRouterOptions,
  addRouteToMap
} from "./base";

import { loadAction } from "./utils";
import { buildRoutesSchema } from "./helpers/buildRoutesSchema";

export const root = (
  middlewares: RequestHandler[] | string,
  actionPath?: string
): void => {
  let handlers: RequestHandler[] = [...getScopeMiddlewares()];
  let finalActionPath: string;

  if (Array.isArray(middlewares)) {
    if (!actionPath) {
      throw new Error("Action path is required when middlewares are provided");
    }
    handlers = [...handlers, ...middlewares];
    finalActionPath = actionPath;
  } else {
    finalActionPath = middlewares;
  }

  handlers.push(loadAction(finalActionPath));
  addRouteToMap("GET", "/", finalActionPath, handlers);
  getRouter().get("/", ...handlers);
};

const createRouteHandler = (
  method: string
): ((
  urlPath: string | RegExp,
  middlewares: RequestHandler[] | string,
  actionPath?: string
) => void) => {
  return (
    urlPath: string | RegExp,
    middlewares: RequestHandler[] | string,
    actionPath?: string
  ): void => {
    let handlers: RequestHandler[] = [...getScopeMiddlewares()];
    let finalActionPath: string;

    if (Array.isArray(middlewares)) {
      if (!actionPath) {
        throw new Error(
          "Action path is required when middlewares are provided"
        );
      }
      handlers = [...handlers, ...middlewares];
      finalActionPath = actionPath;
    } else {
      finalActionPath = middlewares;
    }

    handlers.push(loadAction(finalActionPath));

    const router = getRouter();
    const path =
      urlPath instanceof RegExp
        ? urlPath
        : urlPath.startsWith("/")
          ? urlPath
          : `/${urlPath}`;

    addRouteToMap(method, urlPath, finalActionPath, handlers);

    switch (method) {
      case "get":
        router.get(path, ...handlers);
        break;
      case "post":
        router.post(path, ...handlers);
        break;
      case "put":
        router.put(path, ...handlers);
        break;
      case "patch":
        router.patch(path, ...handlers);
        break;
      case "delete":
        router.delete(path, ...handlers);
        break;
      case "options":
        router.options(path, ...handlers);
        break;
      case "head":
        router.head(path, ...handlers);
        break;
      case "all":
        router.all(path, ...handlers);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  };
};

export const get = createRouteHandler("get");
export const post = createRouteHandler("post");
export const put = createRouteHandler("put");
export const patch = createRouteHandler("patch");
export const destroy = createRouteHandler("delete");
export const options = createRouteHandler("options");
export const head = createRouteHandler("head");
export const all = createRouteHandler("all");

type ResourceOptions = {
  only?: string[];
  except?: string[];
};

export const resources = (
  resourceName: string,
  middlewaresOrOptions?: RequestHandler[] | ResourceOptions,
  options?: ResourceOptions
): void => {
  let middlewares: RequestHandler[] = [];
  let resourceOptions: ResourceOptions = {};

  // Parse arguments
  if (Array.isArray(middlewaresOrOptions)) {
    middlewares = middlewaresOrOptions;
    resourceOptions = options || {};
  } else {
    resourceOptions = middlewaresOrOptions || {};
  }

  const { only, except } = resourceOptions;
  const allActions = [
    "index",
    "new",
    "create",
    "show",
    "edit",
    "update",
    "destroy"
  ];

  // Determine which actions to create
  let actions = allActions;
  if (only) {
    actions = only;
  } else if (except) {
    actions = allActions.filter((action) => !except.includes(action));
  }

  // Normalize resource name and create base path
  const normalizedName = resourceName.toLowerCase();
  const basePath = `/${normalizedName}`;

  // Create routes in specific order to ensure proper matching
  const router = getRouter();

  // 1. Static routes first (no parameters)
  if (actions.includes("new")) {
    router.get(
      basePath + "/new",
      ...createHandlers(middlewares, normalizedName, "new")
    );
  }

  // 2. Static nested routes
  if (actions.includes("edit")) {
    router.get(
      basePath + "/:id/edit",
      ...createHandlers(middlewares, normalizedName, "edit")
    );
  }

  // 3. Root level routes (no parameters)
  if (actions.includes("index")) {
    router.get(
      basePath,
      ...createHandlers(middlewares, normalizedName, "index")
    );
  }
  if (actions.includes("create")) {
    router.post(
      basePath,
      ...createHandlers(middlewares, normalizedName, "create")
    );
  }

  // 4. Parameter routes last
  if (actions.includes("show")) {
    router.get(
      basePath + "/:id",
      ...createHandlers(middlewares, normalizedName, "show")
    );
  }
  if (actions.includes("update")) {
    router.put(
      basePath + "/:id",
      ...createHandlers(middlewares, normalizedName, "update")
    );
    router.patch(
      basePath + "/:id",
      ...createHandlers(middlewares, normalizedName, "update")
    );
  }
  if (actions.includes("destroy")) {
    router.delete(
      basePath + "/:id",
      ...createHandlers(middlewares, normalizedName, "destroy")
    );
  }
};

// Helper function to create handlers array
const createHandlers = (
  middlewares: RequestHandler[],
  resourcePath: string,
  action: string
): RequestHandler[] => {
  const handlers = [...getScopeMiddlewares(), ...middlewares];
  const fullActionPath = `${resourcePath}/${action}`;
  handlers.push(loadAction(fullActionPath));
  return handlers;
};

// Export scope as an alias for routeScope
export const scope = routeScope;

export {
  getRouter,
  getActionsPath,
  setActionsPath,
  resetRouter,
  routeScope,
  setRouterOptions,
  buildRoutesSchema
};
