import { Router, RequestHandler, RouterOptions } from "express";

const DEFAULT_ACTIONS_PATH = "src/actions";

let router: Router | null = null;
let currentScope: string | null = null;
let scopeMiddlewares: RequestHandler[] = [];
let actionsPath: string = DEFAULT_ACTIONS_PATH;
let isCustomPath: boolean = false;
let routerOptions: RouterOptions = {};

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
};
