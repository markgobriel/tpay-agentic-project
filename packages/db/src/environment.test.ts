import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadRepositoryEnv, repositoryEnvPath } from "./environment.js";

const variable = "SAVE_SPEND_ENV_TEST";
const originalValue = process.env[variable];
const temporaryDirectories: string[] = [];

afterEach(async () => {
  if (originalValue === undefined) delete process.env[variable];
  else process.env[variable] = originalValue;
  await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true })));
});

describe("repository environment loading", () => {
  it("resolves the documented repository-root .env from source and build output", () => {
    expect(repositoryEnvPath).toBe(resolve(process.cwd(), ".env"));
  });

  it("loads file defaults without overriding an exported environment value", async () => {
    const directory = await mkdtemp(join(tmpdir(), "save-spend-env-"));
    temporaryDirectories.push(directory);
    const envPath = join(directory, ".env");
    await writeFile(envPath, `${variable}=from-file\n`);

    delete process.env[variable];
    loadRepositoryEnv(envPath);
    expect(process.env[variable]).toBe("from-file");

    process.env[variable] = "from-process";
    loadRepositoryEnv(envPath);
    expect(process.env[variable]).toBe("from-process");
  });
});
