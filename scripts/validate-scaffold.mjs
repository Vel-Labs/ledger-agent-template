#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";

const demos = [
  "01-headless-cli",
  "02-dmk-skills-app",
  "03-hardware-auth",
  "04-comprehensive-workflow"
];

const requiredRootFiles = [
  "README.md",
  "AGENTS.md",
  "docs/LEDGER_LAYERING.md",
  "docs/BUILDER_LADDER.md",
  "docs/GOVERNANCE.md",
  "contracts/EVIDENCE_CONTRACT.md"
];

const requiredDemoFiles = [
  "AGENTS.md",
  "README.md",
  "BOUNDARY.md",
  "BUILDER_PATHS.md"
];

const requiredSkills = [
  "skills/ledger-headless-attestation/SKILL.md",
  "skills/ledger-app-gate/SKILL.md",
  "skills/ledger-auth-sensitive-access/SKILL.md",
  "skills/comprehensive-ledger-workflow/SKILL.md"
];

const boundaryPhrases = [
  "## Proves",
  "## Does Not Prove",
  "## Real",
  "## Mocked Or Dry-Run",
  "## Requires Physical Ledger Confirmation",
  "## Dogfood Evidence"
];

const failures = [];

function requireFile(path) {
  if (!existsSync(path)) failures.push(`Missing ${path}`);
}

for (const file of requiredRootFiles) {
  requireFile(file);
}

for (const file of requiredSkills) {
  requireFile(file);
}

for (const demo of demos) {
  for (const file of requiredDemoFiles) {
    requireFile(`${demo}/${file}`);
  }

  const boundaryPath = `${demo}/BOUNDARY.md`;
  if (existsSync(boundaryPath)) {
    const boundary = readFileSync(boundaryPath, "utf8");
    for (const phrase of boundaryPhrases) {
      if (!boundary.includes(phrase)) {
        failures.push(`${boundaryPath} missing ${phrase}`);
      }
    }
  }

  requireFile(`${demo}/fixtures`);
  requireFile(`${demo}/fixtures/ledger-validation.json`);
  requireFile(`${demo}/receipts`);
}

if (failures.length) {
  console.error("Scaffold validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Scaffold validation passed.");
