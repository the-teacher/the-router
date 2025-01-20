import fs from "fs";
import path from "path";
import {
  getActionsPath,
  isCustomActionsPath,
  getRoutesMap,
  type RouteInfo
} from "./base";
import type { Request, Response } from "express";

const VALID_EXTENSIONS = [".js", ".ts"];
export const getProjectRoot = (): string => process.cwd();

const validateActionsPath = (actionsPath: string): void => {
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
      return candidatePath;
    }
  }
  throw new Error(`Action file ${fullActionPath} does not exist`);
};

const validateActionModule = (
  actionModule: { perform?: unknown },
  fullActionPath: string
): void => {
  if (typeof actionModule.perform !== "function") {
    throw new Error(
      `Action module at ${fullActionPath} must export a 'perform' function`
    );
  }
};

export const loadActionImplementation = async (
  actionPath: string
): Promise<(req: Request, res: Response) => void | Promise<void>> => {
  const actionsPath = getActionsPath();

  validateActionsPath(actionsPath);
  const fullActionPath = resolveFullActionPath(actionsPath, actionPath);
  const validActionPath = validateActionFile(fullActionPath, VALID_EXTENSIONS);
  const actionModule = await import(validActionPath);
  validateActionModule(actionModule, validActionPath);

  return actionModule.perform;
};

export const loadAction = (
  actionPath: string
): ((req: Request, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response): Promise<void> => {
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

export const buildRoutesSchema = async (): Promise<void> => {
  const routesMap = getRoutesMap();
  const projectRoot = getProjectRoot();
  const schemaDir = path.join(projectRoot, "routes");
  const schemaPath = path.join(schemaDir, "routesSchema.md");

  // Create routes directory if it doesn't exist
  if (!fs.existsSync(schemaDir)) {
    fs.mkdirSync(schemaDir, { recursive: true });
  }

  // Generate markdown content
  const content = generateMarkdownSchema(routesMap);

  // Write to file
  fs.writeFileSync(schemaPath, content, "utf8");
};

const generateMarkdownSchema = (routesMap: Map<string, RouteInfo>): string => {
  const lines: string[] = [
    "# API Routes Schema",
    "",
    "| Method | Path | Action | Middlewares |",
    "|--------|------|--------|------------|"
  ];

  // Sort routes by path for better readability
  const sortedRoutes = Array.from(routesMap.values()).sort((a, b) => {
    return a.path.localeCompare(b.path);
  });

  for (const route of sortedRoutes) {
    // Do not count the last middleware, because it is the system `loadAction`
    const middlewaresCount = route.middlewares.length - 1;

    const middlewaresInfo =
      middlewaresCount > 0 ? `${middlewaresCount} middleware(s)` : "none";

    lines.push(
      `| ${route.method} | ${route.path} | ${route.action} | ${middlewaresInfo} |`
    );
  }

  return lines.join("\n");
};
