import fs from "fs";
import path from "path";
import { getActionsPath, isCustomActionsPath } from "./base";
import type { Request, Response } from "express";

const VALID_EXTENSIONS = [".js", ".ts"];
export const getProjectRoot = () => process.cwd();

const validateActionsPath = (actionsPath: string) => {
  if (!actionsPath) {
    throw new Error("Actions path is not set");
  }

  if (!fs.existsSync(actionsPath) || !fs.lstatSync(actionsPath).isDirectory()) {
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
    if (fs.existsSync(candidatePath) && fs.lstatSync(candidatePath).isFile()) {
      return candidatePath; // Return the valid file path
    }
  }
  throw new Error(`Action file ${fullActionPath} does not exist`);
};

const validateActionModule = (
  actionModule: { perform?: unknown },
  fullActionPath: string
) => {
  if (typeof actionModule.perform !== "function") {
    throw new Error(
      `Action module at ${fullActionPath} must export a 'perform' function`
    );
  }
};

export const loadActionImplementation = async (actionPath: string) => {
  const actionsPath = getActionsPath();

  // Validate actions path
  validateActionsPath(actionsPath);

  // Resolve full action path without extension
  const fullActionPath = resolveFullActionPath(actionsPath, actionPath);

  // Validate the file exists with a valid extension
  const validActionPath = validateActionFile(fullActionPath, VALID_EXTENSIONS);

  // Import the module and validate its structure
  const actionModule = await import(validActionPath);
  validateActionModule(actionModule, validActionPath);

  return actionModule.perform;
};

export const loadAction = (actionPath: string) => {
  // Return a RequestHandler function that handles the async operation
  return async (req: Request, res: Response) => {
    try {
      const handler = await loadActionImplementation(actionPath);
      return handler(req, res);
    } catch (error: Error | unknown) {
      res.status(501).json({
        error: "Action loading failed",
        message: "Failed to load the specified action",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
};
