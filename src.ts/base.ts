import { Router, RequestHandler, RouterOptions } from "express";

const DEFAULT_ACTIONS_PATH = "src/actions";

let router: Router | null = null;
let currentScope: string | null = null;
let scopeMiddlewares: RequestHandler[] = [];
let actionsPath: string = DEFAULT_ACTIONS_PATH;
let isCustomPath: boolean = false;
let routerOptions: RouterOptions = {};

type RouteInfo = {
  method: string;
  path: string;
  action: string;
  middlewares: RequestHandler[];
};

// Add routes map
let routesMap: Map<string, RouteInfo> = new Map();

const setRouterOptions = (options: RouterOptions): void => {
  routerOptions = options;
};

const getRouter = (): Router => {
  if (!router) {
    router = Router(routerOptions);
  }
  return router;
};

const resetRouter = (): void => {
  router = null;
  currentScope = null;
  scopeMiddlewares = [];
  isCustomPath = false;
  actionsPath = DEFAULT_ACTIONS_PATH;
  routerOptions = {};
  routesMap = new Map();
};

const setActionsPath = (path: string): string => {
  isCustomPath = true;
  actionsPath = path;
  return path;
};

const isCustomActionsPath = (): boolean => isCustomPath;
const getActionsPath = (): string => actionsPath;

const setRouterScope = (scope: string | null): void => {
  currentScope = scope;
};

const getRouterScope = (): string | null => currentScope;

const getScopeMiddlewares = (): RequestHandler[] => scopeMiddlewares;

const setScopeMiddlewares = (middlewares: RequestHandler[]): void => {
  scopeMiddlewares = middlewares;
};

const routeScope = (
  scope: string,
  middlewaresOrCallback: RequestHandler[] | (() => void),
  routesDefinitionCallback?: () => void
): void => {
  const scopedRouter = Router(routerOptions);
  const originalRouter = router;
  const originalScope = currentScope;
  const originalScopeMiddlewares = scopeMiddlewares;

  // Temporarily replace global router with new scoped one
  router = scopedRouter;

  // Set current scope
  const newScope = originalScope ? `${originalScope}/${scope}` : scope;
  setRouterScope(newScope);

  // Accumulate middlewares from parent scope
  if (Array.isArray(middlewaresOrCallback)) {
    setScopeMiddlewares([
      ...originalScopeMiddlewares,
      ...middlewaresOrCallback
    ]);
    if (routesDefinitionCallback) {
      routesDefinitionCallback();
    }
  } else {
    // Keep parent middlewares when no new ones are added
    setScopeMiddlewares([...originalScopeMiddlewares]);
    middlewaresOrCallback();
  }

  // Restore original router, scope and middlewares
  router = originalRouter;
  setRouterScope(originalScope);
  setScopeMiddlewares(originalScopeMiddlewares);

  // Apply accumulated middlewares to the scoped router
  const currentMiddlewares = getScopeMiddlewares();
  if (currentMiddlewares.length > 0) {
    getRouter().use(`/${scope}`, currentMiddlewares, scopedRouter);
  } else {
    getRouter().use(`/${scope}`, scopedRouter);
  }
};

const addRouteToMap = (
  method: string,
  path: string | RegExp,
  action: string,
  middlewares: RequestHandler[] = []
): void => {
  // Convert RegExp to string if needed
  let pathString = path instanceof RegExp ? path.toString() : path;

  // If we're in a scope and dealing with a RegExp, modify the RegExp pattern
  if (currentScope && path instanceof RegExp) {
    // Remove leading/trailing slashes from the RegExp string
    const regexStr = path.toString().replace(/^\/|\/$/g, "");
    // Create new RegExp with scope prefix
    pathString = `/${currentScope}/${regexStr}/`;
  } else if (typeof path === "string") {
    // Handle string paths as before
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    pathString = currentScope
      ? `/${currentScope}${normalizedPath}`
      : normalizedPath;
  }

  const routeKey = `${method.toUpperCase()}:${pathString}`;
  routesMap.set(routeKey, {
    method: method.toUpperCase(),
    path: pathString,
    action,
    middlewares
  });
};

const getRoutesMap = (): Map<string, RouteInfo> => routesMap;

// Export all functions at the end since there are more than 5 exports
export {
  setRouterOptions,
  getRouter,
  resetRouter,
  setActionsPath,
  isCustomActionsPath,
  getActionsPath,
  setRouterScope,
  getRouterScope,
  getScopeMiddlewares,
  setScopeMiddlewares,
  routeScope,
  addRouteToMap,
  getRoutesMap,
  type RouteInfo
};
