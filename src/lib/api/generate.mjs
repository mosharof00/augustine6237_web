import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dashboardRoot = path.resolve(here, "../../..");

export function missingOpenApiMessage() {
  return "No OpenAPI document found. Checked WINGS_OPENAPI_PATH, ../docs/openapi.json, and ${NEXT_PUBLIC_API_URL}/docs-json.";
}

async function resolveInput() {
  const fromEnv = process.env.WINGS_OPENAPI_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  const repoDoc = path.resolve(dashboardRoot, "../docs/openapi.json");
  if (existsSync(repoDoc)) return repoDoc;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    const response = await fetch(
      `${apiUrl.replace(/\/$/, "")}/docs-json`,
    );
    if (!response.ok) return null;
    const dir = mkdtempSync(path.join(tmpdir(), "wop-openapi-"));
    const file = path.join(dir, "openapi.json");
    writeFileSync(file, await response.text());
    return file;
  } catch {
    return null;
  }
}

async function main() {
  const input = await resolveInput();
  if (!input) {
    console.error(missingOpenApiMessage());
    process.exit(1);
  }
  const bin = path.join(dashboardRoot, "node_modules/.bin/openapi-typescript");
  const output = path.join(dashboardRoot, "src/lib/api/schema.ts");
  const result = spawnSync(bin, [input, "--output", output], {
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  await main();
}
