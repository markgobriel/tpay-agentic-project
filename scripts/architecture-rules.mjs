import path from "node:path";
import { builtinModules } from "node:module";
import ts from "typescript";

const scopes = [
  { name: "web", prefix: "apps/web/" },
  { name: "api", prefix: "apps/api/" },
  { name: "domain", prefix: "packages/domain/" },
  { name: "db", prefix: "packages/db/" },
  { name: "contracts", prefix: "packages/contracts/" },
];

const allowedInternalScopes = {
  web: new Set(["web", "contracts"]),
  api: new Set(["api", "contracts", "domain", "db"]),
  domain: new Set(["domain"]),
  db: new Set(["db"]),
  contracts: new Set(["contracts"]),
};

const allowedExternalPackages = {
  web: new Set(["react", "react-dom", "react-dom/client"]),
  api: new Set(["express"]),
  domain: new Set(),
  db: new Set(["@prisma/client"]),
  contracts: new Set(),
};

const nodeRuntimeScopes = new Set(["api", "db"]);
const nodeBuiltins = new Set(
  builtinModules.flatMap((specifier) => {
    const bareSpecifier = specifier.replace(/^node:/, "");
    return [bareSpecifier, `node:${bareSpecifier}`];
  }),
);

const workspacePackageScopes = new Map([
  ["@save-and-spend/web", "web"],
  ["@save-and-spend/api", "api"],
  ["@save-and-spend/domain", "domain"],
  ["@save-and-spend/db", "db"],
  ["@save-and-spend/contracts", "contracts"],
]);

function scopeForPath(filePath) {
  const normalized = filePath.replaceAll("\\", "/");
  return (
    scopes.find(
      (scope) => normalized === scope.prefix.slice(0, -1) || normalized.startsWith(scope.prefix),
    )?.name ?? null
  );
}

export function isProductionSource(filePath) {
  const normalized = filePath.replaceAll("\\", "/");
  return scopeForPath(normalized) !== null && !/\.(?:test|spec)\.[^.]+$/.test(normalized);
}

function packageRoot(specifier) {
  if (specifier.startsWith("@")) return specifier.split("/").slice(0, 2).join("/");
  return specifier.split("/")[0];
}

export function extractImportSpecifiers(source) {
  return ts.preProcessFile(source, true, true).importedFiles.map((entry) => entry.fileName);
}

function targetScopeForImport(filePath, specifier) {
  const workspaceScope = workspacePackageScopes.get(packageRoot(specifier));
  if (workspaceScope) return workspaceScope;
  if (!specifier.startsWith(".")) return null;
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(filePath), specifier));
  return scopeForPath(resolved);
}

export function findArchitectureViolations(files) {
  const violations = [];

  for (const file of files) {
    const normalizedPath = file.path.replaceAll("\\", "/");
    const sourceScope = scopeForPath(normalizedPath);
    if (!sourceScope || !isProductionSource(normalizedPath)) continue;

    for (const specifier of extractImportSpecifiers(file.source)) {
      const targetScope = targetScopeForImport(normalizedPath, specifier);
      if (targetScope) {
        if (!allowedInternalScopes[sourceScope].has(targetScope)) {
          violations.push(
            `${normalizedPath}: ${sourceScope} must not depend on ${targetScope} (${specifier})`,
          );
        }
        continue;
      }

      if (specifier.startsWith(".")) continue;
      if (nodeBuiltins.has(specifier)) {
        if (!nodeRuntimeScopes.has(sourceScope)) {
          violations.push(
            `${normalizedPath}: ${sourceScope} must not depend on the Node runtime (${specifier})`,
          );
        }
        continue;
      }
      const root = packageRoot(specifier);
      if (
        !allowedExternalPackages[sourceScope].has(specifier) &&
        !allowedExternalPackages[sourceScope].has(root)
      ) {
        violations.push(
          `${normalizedPath}: ${sourceScope} has an unapproved runtime dependency (${specifier})`,
        );
      }
    }
  }

  return violations;
}
