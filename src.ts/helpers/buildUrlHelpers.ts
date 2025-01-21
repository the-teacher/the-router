import fs from "fs";
import path from "path";
import { getRoutesMap, type RouteInfo } from "../base";
import { getProjectRoot } from "../utils";

export const buildUrlHelpers = (route: RouteInfo): string => {
  const { method, path } = route;
  const functionName = `${route.action.replace(/\//g, "_")}_${method.toLowerCase()}_path`;

  const paramNames = Array.from(path.matchAll(/:([a-zA-Z]+)/g)).map(
    (match) => match[1]
  );

  const paramsSignature =
    paramNames.length > 0
      ? `{ ${paramNames.join(", ")}, ...urlParams }: { ${paramNames.map((p) => `${p}: string`).join(", ")}, [key: string]: string | number | boolean }`
      : `urlParams?: Record<string, string | number | boolean>`;

  const pathWithParams = path.replace(
    /:([a-zA-Z]+)/g,
    (_, paramName) => "${" + paramName + "}"
  );

  const needsMethodParam = !["GET", "POST"].includes(method.toUpperCase());
  const methodParam = needsMethodParam ? `_method=${method.toLowerCase()}` : "";

  // Use double quotes for paths without parameters, backticks for paths with parameters
  const quotedPath =
    paramNames.length > 0 ? `\`${pathWithParams}\`` : `"${path}"`;

  const functionBody = `
    return buildUrlWithParams(${quotedPath}${paramNames.length ? `, { ${paramNames.join(", ")} }, urlParams` : ", undefined, urlParams"}${needsMethodParam ? `, "${methodParam}"` : ""});`;

  return `export const ${functionName} = (${paramsSignature}): string => {${functionBody}};`;
};

export const buildRoutesHelpers = async (): Promise<void> => {
  const routesMap = getRoutesMap();
  const projectRoot = getProjectRoot();
  const routesDir = path.join(projectRoot, "routes");
  const helpersPath = path.join(routesDir, "routesHelpers.ts");
  const buildUrlWithParamsPath = path.join(__dirname, "buildUrlWithParams.ts");

  if (!fs.existsSync(routesDir)) {
    fs.mkdirSync(routesDir, { recursive: true });
  }

  const helperFunctions: string[] = [];

  // Read the helper function code
  const helperFunctionCode = fs
    .readFileSync(buildUrlWithParamsPath, "utf8")
    .replace("export function", "function"); // Remove export keyword

  // Add header and helper function
  helperFunctions.push(`// This file is auto-generated. Do not edit manually

// Helper functions
${helperFunctionCode}
`);

  // Generate helper functions for each route
  const routes = Array.from(routesMap.values());
  for (let i = 0; i < routes.length; i++) {
    helperFunctions.push(buildUrlHelpers(routes[i]));
    if (i < routes.length - 1) {
      helperFunctions.push("");
    }
  }

  fs.writeFileSync(helpersPath, helperFunctions.join("\n"), "utf8");
};
