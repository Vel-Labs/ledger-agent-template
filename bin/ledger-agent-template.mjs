#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function usage() {
  console.log("Usage:");
  console.log("  npx ledger-agent-template <target-dir>");
  console.log("  npx ledger-agent-template <target-dir> --force");
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const force = args.includes("--force");
const targetArg = args.find(arg => !arg.startsWith("-")) ?? "ledger-agent-workflows";
const targetRoot = resolve(process.cwd(), targetArg);

const skipDirs = new Set([".git", "node_modules"]);
const skipFiles = new Set(["package-lock.json"]);
const copyRoots = [
  "01-headless-cli",
  "02-dmk-skills-app",
  "03-hardware-auth",
  "04-guided-journey",
  "contracts",
  "docs",
  "scripts",
  "skills",
  "AGENT_START_HERE.md",
  "AGENTS.md",
  "LICENSE",
  "README.md",
  "package.json",
  ".gitignore"
];

function shouldSkip(path) {
  const base = path.split("/").pop();
  return skipDirs.has(base) || skipFiles.has(base);
}

function copyRecursive(source, destination) {
  const sourceStat = statSync(source);

  if (sourceStat.isDirectory()) {
    mkdirSync(destination, { recursive: true });
    for (const entry of readdirSync(source)) {
      const sourcePath = join(source, entry);
      const relativePath = relative(packageRoot, sourcePath);
      if (shouldSkip(relativePath)) continue;
      copyRecursive(sourcePath, join(destination, entry));
    }
    return;
  }

  if (existsSync(destination) && !force) {
    throw new Error(`Refusing to overwrite ${destination}. Rerun with --force if this is intentional.`);
  }

  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}

function packageNameFromTarget(target) {
  return basename(target)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "ledger-agent-workflows";
}

function personalizePackageJson() {
  const packagePath = join(targetRoot, "package.json");
  if (!existsSync(packagePath)) return;

  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  packageJson.name = packageNameFromTarget(targetRoot);
  packageJson.private = true;
  delete packageJson.bin;
  delete packageJson.files;
  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");
}

try {
  mkdirSync(targetRoot, { recursive: true });

  for (const root of copyRoots) {
    const source = join(packageRoot, root);
    if (!existsSync(source)) continue;
    copyRecursive(source, join(targetRoot, root));
  }

  personalizePackageJson();

  console.log(`Ledger agent scaffold written to ${targetRoot}`);
  console.log("");
  console.log("Next:");
  console.log(`  cd ${targetArg}`);
  console.log("  npm install");
  console.log("  npm run check");
  console.log("  npm run demo:journey");
  console.log("");
  console.log("For agent work, start with AGENT_START_HERE.md.");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
