import path from "path";
import { getActionsPath, isCustomActionsPath } from "./base";

export const getProjectRoot = () => process.cwd();

export const normalizeActionPath = (actionPath: string) => {
  if (!actionPath) {
    throw new Error("Action path cannot be empty");
  }
  return actionPath;
};

export const loadAction = (actionPath: string) => {
  try {
    const actionsPath = getActionsPath();
    const normalizedPath = normalizeActionPath(actionPath);
    const actionFile = `${normalizedPath}Action`;
    const fullPath = !isCustomActionsPath()
      ? path.join(process.cwd(), actionsPath, actionFile)
      : path.join(actionsPath, actionFile);

    const actionModule = require(fullPath);

    if (typeof actionModule.perform !== "function") {
      throw new Error(
        `Action module at ${fullPath} must export a 'perform' function`
      );
    }

    return actionModule.perform;
  } catch (error: any) {
    if (error.code === "MODULE_NOT_FOUND") {
      const match = actionPath.match(/\/([^/]+\/)*([^/]+)Action$/);
      const actionName = match
        ? match[0].replace(/^\//, "").replace("Action", "")
        : actionPath;

      console.error(`[WARNING] Action file not found: ${actionPath}`);
      console.error(
        `[WARNING] Please create action file with 'perform' function`
      );

      return (_req: any, res: any) => {
        res.status(501).json({
          error: "Not Implemented",
          message: `Action handler not found: ${actionName}`,
          details: "The requested action has not been implemented yet",
        });
      };
    }

    throw error;
  }
};
