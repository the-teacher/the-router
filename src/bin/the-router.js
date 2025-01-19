#!/usr/bin/env node
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src.ts/bin/the-router.ts
import path2 from "path";

// src.ts/base.ts
import { Router } from "express";
var DEFAULT_ACTIONS_PATH = "src/actions";
var router = null;
var currentScope = null;
var scopeMiddlewares = [];
var actionsPath = DEFAULT_ACTIONS_PATH;
var isCustomPath = false;
var routerOptions = {};
var getRouter = () => {
  if (!router) {
    router = Router(routerOptions);
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
var isCustomActionsPath = () => isCustomPath;
var getActionsPath = () => actionsPath;
var getScopeMiddlewares = () => scopeMiddlewares;

// src.ts/utils.ts
import fs from "fs";
import path from "path";
var VALID_EXTENSIONS = [".js", ".ts"];
var getProjectRoot = () => process.cwd();
var validateActionsPath = (actionsPath2) => {
  if (!actionsPath2) {
    throw new Error("Actions path is not set");
  }
  if (!fs.statSync(actionsPath2).isDirectory()) {
    throw new Error(`Actions path ${actionsPath2} is not a directory`);
  }
};
var resolveFullActionPath = (actionsPath2, actionPath) => {
  if (!actionPath) {
    throw new Error("Action path cannot be empty");
  }
  const actionFile = `${actionPath}Action`;
  return !isCustomActionsPath() ? path.join(getProjectRoot(), actionsPath2, actionFile) : path.join(actionsPath2, actionFile);
};
var validateActionFile = (fullActionPath, validExtensions) => {
  for (const ext of validExtensions) {
    const candidatePath = `${fullActionPath}${ext}`;
    if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
      return candidatePath;
    }
  }
  throw new Error(`Action file ${fullActionPath} does not exist`);
};
var validateActionModule = (actionModule, fullActionPath) => {
  if (typeof actionModule.perform !== "function") {
    throw new Error(
      `Action module at ${fullActionPath} must export a 'perform' function`
    );
  }
};
var loadActionImplementation = (actionPath) => {
  const actionsPath2 = getActionsPath();
  validateActionsPath(actionsPath2);
  const fullActionPath = resolveFullActionPath(actionsPath2, actionPath);
  const validActionPath = validateActionFile(fullActionPath, VALID_EXTENSIONS);
  const actionModule = __require(validActionPath);
  validateActionModule(actionModule, validActionPath);
  return actionModule.perform;
};
var loadAction = (actionPath) => {
  try {
    return loadActionImplementation(actionPath);
  } catch (error) {
    return (req, res) => {
      res.status(501).json({
        error: "Action loading failed",
        message: "Failed to load the specified action",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    };
  }
};

// src.ts/index.ts
var createRouteHandler = (method) => (urlPath, middlewares, actionPath) => {
  let handlers = [...getScopeMiddlewares()];
  let finalActionPath;
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
  const router2 = getRouter();
  const path3 = urlPath instanceof RegExp ? urlPath : urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
  switch (method) {
    case "get":
      router2.get(path3, ...handlers);
      break;
    case "post":
      router2.post(path3, ...handlers);
      break;
    case "put":
      router2.put(path3, ...handlers);
      break;
    case "patch":
      router2.patch(path3, ...handlers);
      break;
    case "delete":
      router2.delete(path3, ...handlers);
      break;
    case "options":
      router2.options(path3, ...handlers);
      break;
    case "head":
      router2.head(path3, ...handlers);
      break;
    case "all":
      router2.all(path3, ...handlers);
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

// src.ts/bin/the-router.ts
var parseArgs = (args) => {
  const options2 = {};
  args.slice(2).forEach((arg) => {
    if (arg.includes("=")) {
      const [key, value] = arg.split("=");
      options2[key] = value;
    }
  });
  return options2;
};
var sync = async (options2) => {
  try {
    if (!options2.routesFile) {
      throw new Error("routesFile parameter is required");
    }
    resetRouter();
    const routesFilePath = path2.resolve(process.cwd(), options2.routesFile);
    console.log("Loading routes from:", routesFilePath);
    await import(routesFilePath);
    const router2 = getRouter();
    console.log("\nConfigured Routes:");
    router2.stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(", ").toUpperCase();
        console.log(`${methods} ${layer.route.path}`);
      }
    });
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
};
var isMainModule = import.meta.url.startsWith("file:");
if (isMainModule) {
  const command = process.argv[2];
  const options2 = parseArgs(process.argv);
  if (!command) {
    console.error("Error: Command is required. Available commands: sync");
    process.exit(1);
  }
  if (command === "sync") {
    sync(options2).catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
  } else {
    console.error("Unknown command. Available commands: sync");
    process.exit(1);
  }
}
export {
  parseArgs,
  sync
};
//# sourceMappingURL=the-router.js.map
