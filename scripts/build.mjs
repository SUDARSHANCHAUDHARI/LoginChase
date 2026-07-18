import { copyFile, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "dist");
const runtimeFiles = ["index.html", "styles.css", "script.js", "favicon.svg", "_headers"];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const filename of runtimeFiles) {
  const source = path.join(projectRoot, filename);
  const destination = path.join(outputDirectory, filename);
  const sourceStats = await stat(source);

  if (!sourceStats.isFile()) {
    throw new Error(`Production source is not a regular file: ${filename}`);
  }

  await copyFile(source, destination);
}

await writeFile(path.join(outputDirectory, ".nojekyll"), "", "utf8");

const artifactFiles = (await readdir(outputDirectory)).sort();
const expectedFiles = [...runtimeFiles, ".nojekyll"].sort();

if (JSON.stringify(artifactFiles) !== JSON.stringify(expectedFiles)) {
  throw new Error(`Unexpected production artifact contents: ${artifactFiles.join(", ")}`);
}

console.log(`✓ Production artifact created with ${artifactFiles.length} allowlisted files`);
