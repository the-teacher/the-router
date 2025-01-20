import fs from "fs";
import path from "path";
import { getRoutesMap, type RouteInfo } from "../base";
import { getProjectRoot } from "../utils";

export const buildUrlHelpers = (route: RouteInfo): string => {
  const { method, path } = route;
  const functionName = `${route.action.replace(/\//g, "_")}_${method.toLowerCase()}_path`;

  // Extract parameter names from the path
  const paramNames = Array.from(path.matchAll(/:([a-zA-Z]+)/g)).map(
    (match) => match[1]
  );

  // Create function signature
  const paramsSignature =
    paramNames.length > 0
      ? `{ ${paramNames.join(", ")} }: Record<string, string>`
      : "";

  // Replace path parameters with template literals
  const pathWithParams = path.replace(
    /:([a-zA-Z]+)/g,
    (_, paramName) => `\${${paramName}}`
  );

  // Generate function body
  const functionBody = `\`${pathWithParams}${method.toLowerCase() === "patch" ? "?_method=patch" : ""}\``;

  return `export const ${functionName} = (${paramsSignature}): string => ${functionBody};`;
};

export const buildRoutesHelpers = async (): Promise<void> => {
  const routesMap = getRoutesMap();
  const projectRoot = getProjectRoot();
  const routesDir = path.join(projectRoot, "routes");
  const helpersPath = path.join(routesDir, "routesHelpers.ts");

  // Create routes directory if it doesn't exist
  if (!fs.existsSync(routesDir)) {
    fs.mkdirSync(routesDir, { recursive: true });
  }

  const helperFunctions: string[] = [];

  // Add imports and type declarations at the top
  helperFunctions.push("// This file is auto-generated. Do not edit manually");
  helperFunctions.push("");

  // Generate helper functions for each route
  for (const route of routesMap.values()) {
    helperFunctions.push(buildUrlHelpers(route));
  }

  // Write to file
  fs.writeFileSync(helpersPath, helperFunctions.join("\n\n"), "utf8");
};
