import { Router, RequestHandler, RouterOptions } from "express";

const DEFAULT_ACTIONS_PATH = "src/actions";

let router: Router | null = null;
let currentScope: string | null = null;
let scopeMiddlewares: RequestHandler[] = [];
let actionsPath: string = DEFAULT_ACTIONS_PATH;
let isCustomPath: boolean = false;
let routerOptions: RouterOptions = {};

export const setRouterOptions = (options: RouterOptions) => {
  routerOptions = options;
};

export const getRouter = () => {
  if (!router) {
    router = Router(routerOptions);
  }
  return router;
};

export const resetRouter = () => {
  router = null;
  currentScope = null;
  scopeMiddlewares = [];
  isCustomPath = false;
  actionsPath = DEFAULT_ACTIONS_PATH;
  routerOptions = {};
};
export const setActionsPath = (path: string) => {
  isCustomPath = true;
  actionsPath = path;
  return path;
};

export const isCustomActionsPath = () => isCustomPath;
export const getActionsPath = () => actionsPath;

export const setRouterScope = (scope: string | null) => {
  currentScope = scope;
};

export const getRouterScope = () => currentScope;

export const getScopeMiddlewares = () => scopeMiddlewares;

export const setScopeMiddlewares = (middlewares: RequestHandler[]) => {
  scopeMiddlewares = middlewares;
};

export const routeScope = (
  scope: string,
  middlewaresOrCallback: RequestHandler[] | (() => void),
  routesDefinitionCallback?: () => void
) => {
  const scopedRouter = Router(routerOptions);
  const originalRouter = router;
  const originalScopeMiddlewares = scopeMiddlewares;

  // Temporarily replace global router with a new one
  router = scopedRouter;

  // Set current scope and its middlewares
  setRouterScope(scope);

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
  setRouterScope(null);
  setScopeMiddlewares(originalScopeMiddlewares);

  // Mount scoped router to the main router with scope prefix
  getRouter().use(`/${scope}`, scopedRouter);
};
