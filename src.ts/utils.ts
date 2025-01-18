import fs from "fs";
import path from "path";
import { getActionsPath, isCustomActionsPath } from "./base";

const VALID_EXTENSIONS = [".js", ".ts"];
export const getProjectRoot = () => process.cwd();

const validateActionsPath = (actionsPath: string) => {
  if (!actionsPath) {
    throw new Error("Actions path is not set");
  }

  if (!fs.statSync(actionsPath).isDirectory()) {
    throw new Error(`Actions path ${actionsPath} is not a directory`);
  }
};

const resolveFullActionPath = (
  actionsPath: string,
  actionPath: string
): string => {
  if (!actionPath) {
    throw new Error("Action path cannot be empty");
  }

  const actionFile = `${actionPath}Action`;

  return !isCustomActionsPath()
    ? path.join(getProjectRoot(), actionsPath, actionFile)
    : path.join(actionsPath, actionFile);
};

const validateActionFile = (
  fullActionPath: string,
  validExtensions: string[]
): string => {
  for (const ext of validExtensions) {
    const candidatePath = `${fullActionPath}${ext}`;
    if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
      return candidatePath; // Return the valid file path
    }
  }
  throw new Error(`Action file ${fullActionPath} does not exist`);
};

const validateActionModule = (actionModule: any, fullActionPath: string) => {
  if (typeof actionModule.perform !== "function") {
    throw new Error(
      `Action module at ${fullActionPath} must export a 'perform' function`
    );
  }
};

export const loadActionImplementation = (actionPath: string) => {
  const actionsPath = getActionsPath();

  // Validate actions path
  validateActionsPath(actionsPath);

  // Resolve full action path without extension
  const fullActionPath = resolveFullActionPath(actionsPath, actionPath);

  // Validate the file exists with a valid extension
  const validActionPath = validateActionFile(fullActionPath, VALID_EXTENSIONS);

  // Require the module and validate its structure
  const actionModule = require(validActionPath);
  validateActionModule(actionModule, validActionPath);

  return actionModule.perform;
};

export const loadAction = (actionPath: string) => {
  try {
    return loadActionImplementation(actionPath);
  } catch (error: any) {
    return (_req: any, res: any) => {
      res.status(501).json({
        error: "Action loading failed",
        message: "Failed to load the specified action",
        details: error.message,
      });
    };

    throw error;
  }
};
