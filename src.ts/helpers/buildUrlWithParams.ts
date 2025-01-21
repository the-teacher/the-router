export function buildUrlWithParams(
  pathTemplate: string,
  pathParams?: Record<string, string>,
  urlParams?: Record<string, string | number | boolean | undefined | null>,
  methodParam?: string
): string {
  // replace path params
  let path = pathTemplate;
  if (pathParams) {
    // First collect all replacements to avoid partial replacements
    const replacements: [string, string][] = Object.entries(pathParams).map(
      ([key, value]) => [
        `:${key}`,
        encodeURIComponent(String(value)).replace(/%2F/g, "/")
      ]
    );

    // Then apply all replacements
    replacements.forEach(([placeholder, encodedValue]) => {
      path = path.replace(placeholder, encodedValue);
    });
  }

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

  return `${path}${query.length ? "?" + query.join("&") : ""}`;
}
