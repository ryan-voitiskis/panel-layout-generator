import { mkdir, readFile, writeFile } from "node:fs/promises"
import ts from "typescript"

const serverDirectory = new URL("../dist/server/", import.meta.url)
const workerSource = await readFile(
  new URL("../worker/index.ts", import.meta.url),
  "utf8",
)
const workerOutput = ts.transpileModule(workerSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText

await mkdir(serverDirectory, { recursive: true })

await Promise.all([
  writeFile(new URL("index.js", serverDirectory), workerOutput),
  writeFile(
    new URL("wrangler.json", serverDirectory),
    `${JSON.stringify(
      {
        name: "panel-layout-generator",
        main: "index.js",
        compatibility_date: "2026-07-13",
        assets: {
          binding: "ASSETS",
          directory: "../client",
          not_found_handling: "single-page-application",
        },
      },
      null,
      2,
    )}\n`,
  ),
])
