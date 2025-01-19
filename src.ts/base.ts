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
  routesMap = new Map(); // Reset routes map
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

  // Temporarily replace global router with a new one
  router = scopedRouter;

  // Set current scope and its middlewares
  const newScope = originalScope ? `${originalScope}/${scope}` : scope;
  setRouterScope(newScope);

  if (Array.isArray(middlewaresOrCallback)) {
    setScopeMiddlewares(middlewaresOrCallback);
    if (routesDefinitionCallback) {
      routesDefinitionCallback();
    }
  } else {
    setScopeMiddlewares([]);
    middlewaresOrCallback();
  }

  // Restore original router, scope and middlewares
  router = originalRouter;
  setRouterScope(originalScope);
  setScopeMiddlewares(originalScopeMiddlewares);

  // Mount scoped router to the main router with scope prefix
  const mountPath = `/${scope}`;
  getRouter().use(mountPath, scopedRouter);
};

const addRouteToMap = (
  method: string,
  path: string | RegExp,
  action: string,
  middlewares: RequestHandler[] = []
): void => {
  // Convert RegExp to string if needed
  const pathString = path instanceof RegExp ? path.toString() : path;

  // Normalize the path to ensure it starts with / (only for string paths)
  const normalizedPath =
    typeof path === "string"
      ? path.startsWith("/")
        ? path
        : `/${path}`
      : pathString;

  // If we're in a scope, prefix the path with the scope (only for string paths)
  const scopedPath =
    typeof path === "string" && currentScope
      ? `/${currentScope}${normalizedPath}`
      : normalizedPath;

  const routeKey = `${method.toUpperCase()}:${scopedPath}`;
  routesMap.set(routeKey, {
    method: method.toUpperCase(),
    path: scopedPath,
    action,
    middlewares,
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
  type RouteInfo,
};
