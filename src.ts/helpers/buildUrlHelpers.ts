import { getRoutesMap, type RouteInfo } from "../base";

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

export const buildRoutesHelpers = (): string => {
  const routesMap = getRoutesMap();
  const helperFunctions: string[] = [];

  for (const route of routesMap.values()) {
    helperFunctions.push(buildUrlHelpers(route));
  }

  return helperFunctions.join("\n\n");
};
