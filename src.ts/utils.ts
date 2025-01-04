import path from "path";
import { getActionsPath, isCustomActionsPath } from "./base";

export const getProjectRoot = () => process.cwd();

export const parseScopeActionString = (scopeActionString: string) => {
  const [scope, action] = scopeActionString.split("#");
  if (!scope || !action) {
    throw new Error(
      `Invalid format for scope action: ${scopeActionString}. Expected format is 'scope#action'.`
    );
  }
  return { scope, action };
};

export const buildActionPath = (scope: string, action: string) => {
  const actionsPath = getActionsPath();
  const normalizedScope = scope.replace(/\//g, path.sep);
  const actionFile = `${action}Action`;

  if (!isCustomActionsPath()) {
    return path.join(process.cwd(), actionsPath, normalizedScope, actionFile);
  }

  return path.join(actionsPath, normalizedScope, actionFile);
};

export const loadAction = (scope: string, action: string) => {
  const actionPath = buildActionPath(scope, action);

  try {
    const actionModule = require(actionPath);

    if (typeof actionModule.perform !== "function") {
      throw new Error(
        `Action module for scope: ${scope}, action: ${action} must export a 'perform' function`
      );
    }

    return actionModule.perform;
  } catch (error: any) {
    if (error.code === "MODULE_NOT_FOUND") {
      throw error;
    }
    throw error;
  }
};
