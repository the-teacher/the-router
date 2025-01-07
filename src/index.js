"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all2) => {
  for (var name in all2)
    __defProp(target, name, { get: all2[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src.ts/index.ts
var src_exports = {};
__export(src_exports, {
  all: () => all,
  destroy: () => destroy,
  get: () => get,
  getActionsPath: () => getActionsPath,
  getRouter: () => getRouter,
  head: () => head,
  options: () => options,
  patch: () => patch,
  post: () => post,
  put: () => put,
  resetRouter: () => resetRouter,
  resources: () => resources,
  root: () => root,
  routeScope: () => routeScope,
  scope: () => scope,
  setActionsPath: () => setActionsPath,
  setRouterOptions: () => setRouterOptions
});
module.exports = __toCommonJS(src_exports);

// src.ts/base.ts
var import_express = require("express");
var DEFAULT_ACTIONS_PATH = "src/actions";
var router = null;
var currentScope = null;
var scopeMiddlewares = [];
var actionsPath = DEFAULT_ACTIONS_PATH;
var isCustomPath = false;
var routerOptions = {};
var setRouterOptions = (options2) => {
  routerOptions = options2;
};
var getRouter = () => {
  if (!router) {
    router = (0, import_express.Router)(routerOptions);
  }
  return router;
};
var resetRouter = () => {
  router = null;
  currentScope = null;
  scopeMiddlewares = [];
  isCustomPath = false;
  actionsPath = DEFAULT_ACTIONS_PATH;
  routerOptions = {};
};
var setActionsPath = (path2) => {
  isCustomPath = true;
  actionsPath = path2;
  return path2;
};
var isCustomActionsPath = () => isCustomPath;
var getActionsPath = () => actionsPath;
var setRouterScope = (scope2) => {
  currentScope = scope2;
};
var getScopeMiddlewares = () => scopeMiddlewares;
var setScopeMiddlewares = (middlewares) => {
  scopeMiddlewares = middlewares;
};
var routeScope = (scope2, middlewaresOrCallback, routesDefinitionCallback) => {
  const scopedRouter = (0, import_express.Router)(routerOptions);
  const originalRouter = router;
  const originalScopeMiddlewares = scopeMiddlewares;
  router = scopedRouter;
  setRouterScope(scope2);
  if (Array.isArray(middlewaresOrCallback)) {
    setScopeMiddlewares(middlewaresOrCallback);
    if (routesDefinitionCallback) {
      routesDefinitionCallback();
    }
  } else {
    setScopeMiddlewares([]);
    middlewaresOrCallback();
  }
  router = originalRouter;
  setRouterScope(null);
  setScopeMiddlewares(originalScopeMiddlewares);
  getRouter().use(`/${scope2}`, scopedRouter);
};

// src.ts/utils.ts
var import_path = __toESM(require("path"));
var parseScopeActionString = (scopeActionString) => {
  const [scope2, action] = scopeActionString.split("#");
  if (!scope2 || !action) {
    throw new Error(
      `Invalid format for scope action: ${scopeActionString}. Expected format is 'scope#action'.`
    );
  }
  return { scope: scope2, action };
};
var buildActionPath = (scope2, action) => {
  const actionsPath2 = getActionsPath();
  const normalizedScope = scope2.replace(/\//g, import_path.default.sep);
  const actionFile = `${action}Action`;
  if (!isCustomActionsPath()) {
    return import_path.default.join(process.cwd(), actionsPath2, normalizedScope, actionFile);
  }
  return import_path.default.join(actionsPath2, normalizedScope, actionFile);
};
var loadAction = (actionPath) => {
  try {
    const actionModule = require(actionPath);
    if (typeof actionModule.perform !== "function") {
      throw new Error(
        `Action module at ${actionPath} must export a 'perform' function`
      );
    }
    return actionModule.perform;
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      console.error(`[WARNING] Action file not found: ${actionPath}`);
      console.error(
        `[WARNING] Please create action file with 'perform' function`
      );
      return (_req, res) => {
        res.status(501).json({
          error: "Not Implemented",
          message: `Action handler not found: ${actionPath}`,
          details: "The requested action has not been implemented yet"
        });
      };
    }
    throw error;
  }
};

// src.ts/index.ts
var root = (middlewares, scopeAction) => {
  let handlers = [...getScopeMiddlewares()];
  let actionString;
  if (Array.isArray(middlewares)) {
    if (!scopeAction)
      throw new Error(
        "Action string is required when middlewares are provided"
      );
    handlers = [...handlers, ...middlewares];
    actionString = scopeAction;
  } else {
    actionString = middlewares;
  }
  const { scope: scope2, action } = parseScopeActionString(actionString);
  handlers.push(loadActionHandler(scope2, action));
  getRouter().get("/", ...handlers);
};
var createRouteHandler = (method) => (urlPath, middlewares, scopeAction) => {
  let handlers = [...getScopeMiddlewares()];
  let actionString;
  if (Array.isArray(middlewares)) {
    if (!scopeAction)
      throw new Error(
        "Action string is required when middlewares are provided"
      );
    handlers = [...handlers, ...middlewares];
    actionString = scopeAction;
  } else {
    actionString = middlewares;
  }
  const { scope: scope2, action } = parseScopeActionString(actionString);
  handlers.push(loadActionHandler(scope2, action));
  const router2 = getRouter();
  const path2 = urlPath instanceof RegExp ? urlPath : urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
  switch (method) {
    case "get":
      router2.get(path2, ...handlers);
      break;
    case "post":
      router2.post(path2, ...handlers);
      break;
    case "put":
      router2.put(path2, ...handlers);
      break;
    case "patch":
      router2.patch(path2, ...handlers);
      break;
    case "delete":
      router2.delete(path2, ...handlers);
      break;
    case "options":
      router2.options(path2, ...handlers);
      break;
    case "head":
      router2.head(path2, ...handlers);
      break;
    case "all":
      router2.all(path2, ...handlers);
      break;
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
};
var get = createRouteHandler("get");
var post = createRouteHandler("post");
var put = createRouteHandler("put");
var patch = createRouteHandler("patch");
var destroy = createRouteHandler("delete");
var options = createRouteHandler("options");
var head = createRouteHandler("head");
var all = createRouteHandler("all");
var resources = (resourceName, middlewaresOrOptions, options2) => {
  let middlewares = [];
  let resourceOptions = {};
  if (Array.isArray(middlewaresOrOptions)) {
    middlewares = middlewaresOrOptions;
    resourceOptions = options2 || {};
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
  let actions = allActions;
  if (only) {
    actions = only;
  } else if (except) {
    actions = allActions.filter((action) => !except.includes(action));
  }
  const normalizedName = resourceName.toLowerCase();
  const basePath = `/${normalizedName}`;
  const router2 = getRouter();
  if (actions.includes("new")) {
    router2.get(
      basePath + "/new",
      ...createHandlers(middlewares, normalizedName, "new")
    );
  }
  if (actions.includes("edit")) {
    router2.get(
      basePath + "/:id/edit",
      ...createHandlers(middlewares, normalizedName, "edit")
    );
  }
  if (actions.includes("index")) {
    router2.get(
      basePath,
      ...createHandlers(middlewares, normalizedName, "index")
    );
  }
  if (actions.includes("create")) {
    router2.post(
      basePath,
      ...createHandlers(middlewares, normalizedName, "create")
    );
  }
  if (actions.includes("show")) {
    router2.get(
      basePath + "/:id",
      ...createHandlers(middlewares, normalizedName, "show")
    );
  }
  if (actions.includes("update")) {
    router2.put(
      basePath + "/:id",
      ...createHandlers(middlewares, normalizedName, "update")
    );
    router2.patch(
      basePath + "/:id",
      ...createHandlers(middlewares, normalizedName, "update")
    );
  }
  if (actions.includes("destroy")) {
    router2.delete(
      basePath + "/:id",
      ...createHandlers(middlewares, normalizedName, "destroy")
    );
  }
};
var createHandlers = (middlewares, scope2, action) => {
  const handlers = [...getScopeMiddlewares(), ...middlewares];
  handlers.push(loadActionHandler(scope2, action));
  return handlers;
};
var scope = routeScope;
var loadActionHandler = (scope2, action) => {
  const actionPath = buildActionPath(scope2, action);
  return loadAction(actionPath);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  all,
  destroy,
  get,
  getActionsPath,
  getRouter,
  head,
  options,
  patch,
  post,
  put,
  resetRouter,
  resources,
  root,
  routeScope,
  scope,
  setActionsPath,
  setRouterOptions
});
//# sourceMappingURL=index.js.map
