import { config } from "dotenv";
import { fileURLToPath } from "node:url";

/** Repository-root environment file documented for external PostgreSQL runs. */
export const repositoryEnvPath = fileURLToPath(new URL("../../../.env", import.meta.url));

/**
 * Loads repository-local defaults without replacing values supplied by the
 * process, CI, preview supervisor, or deployment environment.
 */
export function loadRepositoryEnv(path = repositoryEnvPath): void {
  config({ path, override: false, quiet: true });
}
