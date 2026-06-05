import { readFileSync, writeFileSync, readdirSync } from "fs";

// Rename ASSETS binding to STATIC_ASSETS to avoid conflict with Cloudflare Pages reserved name.
// Also patch the worker entry file to use the new binding name.
const wranglerPath = "dist/server/wrangler.json";
const wrangler = JSON.parse(readFileSync(wranglerPath, "utf8"));

if (wrangler.assets?.binding === "ASSETS") {
  wrangler.assets.binding = "STATIC_ASSETS";
  writeFileSync(wranglerPath, JSON.stringify(wrangler));

  const chunksDir = "dist/server/chunks";
  const entryFile = readdirSync(chunksDir).find((f) => f.startsWith("worker-entry"));
  if (entryFile) {
    const entryPath = `${chunksDir}/${entryFile}`;
    const patched = readFileSync(entryPath, "utf8")
      .replaceAll("env2.ASSETS.", "env2.STATIC_ASSETS.")
      .replaceAll("env.ASSETS.", "env.STATIC_ASSETS.");
    writeFileSync(entryPath, patched);
  }
}
