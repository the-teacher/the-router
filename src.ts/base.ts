import { Router, RequestHandler, RouterOptions } from "express";
import {
  RouterState,
  RouteInfo,
  createRouterState,
  resetRouterState
} from "./router-state";

// Global router state
let state: RouterState = createRouterState();

// Router configuration functions
/**
 * Sets options for Express Router
 * @param options - Router configuration options
 */
export const setRouterOptions = (options: RouterOptions): void => {
  state.routerOptions = options;
};

/**
 * Returns current router instance or creates a new one if it doesn't exist
 * @returns Express Router instance
 */
export const getRouter = (): Router => {
  if (!state.router) {
    state.router = Router(state.routerOptions);
  }
  return state.router;
};

export const resetRouter = (): void => {
  state = resetRouterState();
};

// Functions for working with action paths
export const setActionsPath = (path: string): string => {
  state.isCustomPath = true;
  state.actionsPath = path;
  return path;
};

export const isCustomActionsPath = (): boolean => state.isCustomPath;
export const getActionsPath = (): string => state.actionsPath;

// Functions for working with scopes
export const setRouterScope = (scope: string | null): void => {
  state.currentScope = scope;
};

export const getRouterScope = (): string | null => state.currentScope;

export const getScopeMiddlewares = (): RequestHandler[] =>
  state.scopeMiddlewares;

export const setScopeMiddlewares = (middlewares: RequestHandler[]): void => {
  state.scopeMiddlewares = middlewares;
};

export const routeScope = (
  scope: string,
  middlewaresOrCallback: RequestHandler[] | (() => void),
  routesDefinitionCallback?: () => void
): void => {
  const scopedRouter = Router(state.routerOptions);
  const originalRouter = state.router;
  const originalScope = state.currentScope;
  const originalScopeMiddlewares = state.scopeMiddlewares;

  // Temporarily replace global router with new scoped one
  state.router = scopedRouter;

  // Set current scope
  const newScope = originalScope ? `${originalScope}/${scope}` : scope;
  setRouterScope(newScope);

  // Process middlewares
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
  state.router = originalRouter;
  setRouterScope(originalScope);
  setScopeMiddlewares(originalScopeMiddlewares);

  // Apply scoped router with its middlewares
  getRouter().use(`/${scope}`, scopedRouter);
};

// Route management functions
export const addRouteToMap = (
  method: string,
  path: string | RegExp,
  action: string,
  middlewares: RequestHandler[] = []
): void => {
  // Convert RegExp to string if needed
  let pathString = path instanceof RegExp ? path.toString() : path;

  // Process paths considering current scope
  if (state.currentScope && path instanceof RegExp) {
    const regexStr = path.toString().replace(/^\/|\/$/g, "");
    pathString = `/${state.currentScope}/${regexStr}/`;
  } else if (typeof path === "string") {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    pathString = state.currentScope
      ? `/${state.currentScope}${normalizedPath}`
      : normalizedPath;
  }

  const routeKey = `${method.toUpperCase()}:${pathString}`;
  state.routesMap.set(routeKey, {
    method: method.toUpperCase(),
    path: pathString,
    action,
    middlewares
  });
};

export const getRoutesMap = (): Map<string, RouteInfo> => state.routesMap;

export type { RouteInfo };
