const productionApiBase = import.meta.env.PROD ? "/api" : "";

export function apiPath(path: `/${string}`, base = productionApiBase): string {
  return `${base.replace(/\/$/, "")}${path}`;
}
