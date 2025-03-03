import { Router, RequestHandler, RouterOptions } from "express";

const DEFAULT_ACTIONS_PATH = "src/actions";

export type RouteInfo = {
  method: string;
  path: string;
  action: string;
  middlewares: RequestHandler[];
};

export type RouterState = {
  router: Router | null;
  currentScope: string | null;
  scopeMiddlewares: RequestHandler[];
  actionsPath: string;
  isCustomPath: boolean;
  routerOptions: RouterOptions;
  routesMap: Map<string, RouteInfo>;
};

export const createRouterState = (): RouterState => {
  return {
    router: null,
    currentScope: null,
    scopeMiddlewares: [],
    actionsPath: DEFAULT_ACTIONS_PATH,
    isCustomPath: false,
    routerOptions: {},
    routesMap: new Map()
  };
};

export const resetRouterState = (): RouterState => {
  return createRouterState();
};
