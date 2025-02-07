import fs from "fs";
import path from "path";
import { getRoutesMap, type RouteInfo } from "../base";
import { getProjectRoot } from "../utils";

/**
 * Encodes a path parameter, ensuring all special characters are properly encoded.
 */
export function encodePathParam(value: string): string {
  return String(value)
    .split("/")
    .map((segment) =>
      encodeURIComponent(segment).replace(
        /[!'()*]/g,
        (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
      )
    )
    .join("/");
}

/**
 * Replaces placeholders in the path template with actual values.
 */
export function replacePathParams(
  pathTemplate: string,
  pathParams: Record<string, string>
): string {
  let path = pathTemplate;

  const replacements = Object.entries(pathParams).map(([key, value]) => [
    `:${key}`,
    encodePathParam(value)
  ]);

  replacements.forEach(([placeholder, encodedValue]) => {
    path = path.replace(new RegExp(placeholder, "g"), encodedValue);
  });

  return path;
}

/**
 * Builds query string from the given URL parameters.
 */
export function buildQueryString(
  urlParams?: Record<string, string | number | boolean | undefined | null>,
  methodParam?: string
): string {
  const query: string[] = [];
  if (methodParam) query.push(methodParam);

  const params = new URLSearchParams();
  if (urlParams) {
    Object.entries(urlParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const paramsString = params.toString();
  if (paramsString) query.push(paramsString);

  return query.length ? "?" + query.join("&") : "";
}

/**
 * Main function: builds a complete URL with path and query parameters.
 */
export function buildUrlWithParams(
  pathTemplate: string,
  pathParams?: Record<string, string>,
  urlParams?: Record<string, string | number | boolean | undefined | null>,
  methodParam?: string
): string {
  const path = pathParams
    ? replacePathParams(pathTemplate, pathParams)
    : pathTemplate;
  const queryString = buildQueryString(urlParams, methodParam);
  return `${path}${queryString}`;
}
