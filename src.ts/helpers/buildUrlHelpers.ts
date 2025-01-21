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

  // Create function signature with required params and rest parameters
  const paramsSignature =
    paramNames.length > 0
      ? `{ ${paramNames.join(", ")}, ...urlParams }: { ${paramNames.map((p) => `${p}: string`).join(", ")}, [key: string]: string | number | boolean }`
      : `urlParams?: Record<string, string | number | boolean>`;

  // Replace path parameters with template literals
  const pathWithParams = path.replace(
    /:([a-zA-Z]+)/g,
    (_, paramName) => `\${${paramName}}`
  );

  // Add _method parameter for non-GET/POST methods
  const needsMethodParam = !["GET", "POST"].includes(method.toUpperCase());
  const methodParam = needsMethodParam ? `_method=${method.toLowerCase()}` : "";

  // Generate function body with urlParams support
  const functionBody = `
    const query = [];${needsMethodParam ? `\n    query.push("${methodParam}");` : ""}
    const params = new URLSearchParams();${
      paramNames.length > 0
        ? `\n    const { ${paramNames.join(", ")}, ...restParams } = urlParams;\n    Object.entries(restParams).forEach(([key, value]) => {`
        : `\n    Object.entries(urlParams || {}).forEach(([key, value]) => {`
    }
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const paramsString = params.toString();
    if (paramsString) query.push(paramsString);
    return \`${pathWithParams}\${query.length ? '?' + query.join('&') : ''}\``;

  return `export const ${functionName} = (${paramsSignature}): string => {${functionBody}};`;
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
  helperFunctions.push(
    "// This file is auto-generated. Do not edit manually\n"
  );

  // Generate helper functions for each route
  const routes = Array.from(routesMap.values());
  for (let i = 0; i < routes.length; i++) {
    helperFunctions.push(buildUrlHelpers(routes[i]));
    // Add newline after each function except the last one
    if (i < routes.length - 1) {
      helperFunctions.push("");
    }
  }

  // Write to file
  fs.writeFileSync(helpersPath, helperFunctions.join("\n"), "utf8");
};
