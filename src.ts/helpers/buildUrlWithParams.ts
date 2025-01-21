export function buildUrlWithParams(
  pathTemplate: string,
  pathParams?: Record<string, string>,
  urlParams?: Record<string, string | number | boolean>,
  methodParam?: string
): string {
  const query: string[] = [];
  if (methodParam) query.push(methodParam);

  const params = new URLSearchParams();
  const restParams = urlParams || {};

  Object.entries(restParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const paramsString = params.toString();
  if (paramsString) query.push(paramsString);

  return `${pathTemplate}${query.length ? "?" + query.join("&") : ""}`;
}
