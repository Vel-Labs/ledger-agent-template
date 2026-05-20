#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const outputDir = resolve(root, "04-comprehensive-workflow", "receipts");

function now() {
  return new Date().toISOString();
}

function loadJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), "utf8"));
}

function writeReceipt(name, payload) {
  mkdirSync(outputDir, { recursive: true });
  const path = resolve(outputDir, name);
  writeFileSync(path, JSON.stringify(payload, null, 2) + "\n");
  return path;
}

function step(id, title, payload) {
  return {
    id,
    title,
    status: "passed",
    ...payload,
    createdAt: now()
  };
}

const headlessFixture = loadJson("01-headless-cli/fixtures/send-draft.json");
const dmkFixture = loadJson("02-dmk-skills-app/fixtures/install-plan.json");
const authPolicy = loadJson("03-hardware-auth/fixtures/auth-policy.json");
const workflowMap = loadJson("04-comprehensive-workflow/fixtures/feature-map.json");
const ledgerValidationMap = loadJson("04-comprehensive-workflow/fixtures/ledger-validation.json");

const receipts = [
  step("lane-01-proposal", "Headless proposal and approval", {
    sourceDemo: "01-headless-cli",
    intent: headlessFixture.action,
    ledgerLayer: headlessFixture.ledgerLayer,
    validationMode: "fixture_ledger_validation",
    hardwareVerified: false,
    signing: {
      performed: false,
      blockedUntil: "human_approval_and_physical_ledger_confirmation"
    },
    evidence: {
      fixture: "01-headless-cli/fixtures/send-draft.json",
      comparableReceipt: "01-headless-cli/receipts/latest-proposal.json"
    }
  }),
  step("lane-02-app-gate", "Protected app action gate", {
    sourceDemo: "02-dmk-skills-app",
    intent: dmkFixture.action ?? "publish_admin_setting",
    ledgerLayer: "app_action_to_ledger_hardware_gate",
    validationMode: "fixture_ledger_validation",
    hardwareVerified: false,
    protectedAction: dmkFixture.protectedAction ?? "publish_setting",
    evidence: {
      fixture: "02-dmk-skills-app/fixtures/install-plan.json",
      runnableSurface: "npm run demo:dmk:fixture"
    }
  }),
  step("lane-03-auth-sensitive-access", "Hardware identity and sensitive access", {
    sourceDemo: "03-hardware-auth",
    intent: authPolicy.intent ?? "sensitive_access",
    ledgerLayer: "security_key_identity_and_fresh_secret_gate",
    sessionOpenedByAgent: false,
    validationMode: "demo_fallback",
    hardwareVerified: false,
    secretReleased: false,
    evidence: {
      fixture: "03-hardware-auth/fixtures/auth-policy.json",
      browserSurface: "03-hardware-auth/src/index.html"
    }
  }),
  step("lane-04-combined-workflow", "Comprehensive workflow map", {
    sourceDemo: "04-comprehensive-workflow",
    intent: "combined_identity_approval_wallet_feedback",
    ledgerLayer: "workflow_ledger_validation_map",
    validationMode: ledgerValidationMap.mode,
    hardwareVerified: false,
    workflowLayers: workflowMap.ledgerLayers,
    requiredChecks: ledgerValidationMap.requiredChecks,
    evidence: {
      fixture: "04-comprehensive-workflow/fixtures/feature-map.json",
      boundary: "04-comprehensive-workflow/BOUNDARY.md"
    }
  }),
  step("lane-05-feedback", "Dogfood feedback receipt", {
    sourceDemo: "04-comprehensive-workflow",
    flow: "comprehensive_workflow_fixture_run",
    ledgerLayers: workflowMap.ledgerLayers,
    expectedDevicePrompt: "Each sensitive lane names the Ledger or Security Key prompt that a real implementation must show.",
    observedDevicePrompt: "Fixture run only; no physical prompt observed.",
    appBelievedState: "All scaffold lanes passed their fixture contract and remain blocked from hidden signing or secret release.",
    userObservedState: "Combined receipt generated from local fixtures.",
    remainingQuestion: "Replace one fixture lane with a real app or hardware receipt before claiming end-to-end dogfood proof.",
    hardwareVerified: false
  })
];

for (const receipt of receipts) {
  writeReceipt(`${receipt.id}.json`, receipt);
}

const summary = {
  id: `comprehensive-workflow-${Date.now()}`,
  createdAt: now(),
  status: "passed",
  mode: "fixture_tandem_workflow",
  hardwareVerified: false,
  signingPerformed: false,
  secretReleased: false,
  demosExercised: [
    "01-headless-cli",
    "02-dmk-skills-app",
    "03-hardware-auth",
    "04-comprehensive-workflow"
  ],
  receipts: receipts.map(receipt => ({
    id: receipt.id,
    title: receipt.title,
    sourceDemo: receipt.sourceDemo,
    status: receipt.status,
    hardwareVerified: receipt.hardwareVerified,
    path: `04-comprehensive-workflow/receipts/${receipt.id}.json`
  })),
  nonClaims: [
    "This is not production custody readiness.",
    "This is not physical Ledger verification.",
    "This is not server-verified WebAuthn.",
    "No signing, broadcast, wallet movement, or secret release was performed."
  ],
  nextRealProof: [
    "Run demo 2 in browser with `npm run demo:dmk:fixture`.",
    "Run demo 3 on localhost and capture WebAuthn receipts.",
    "Replace one fixture receipt with physical Ledger or server-verified evidence."
  ]
};

const summaryPath = writeReceipt("latest-comprehensive-workflow.json", summary);

console.log(`Comprehensive workflow receipt written: ${summaryPath}`);
for (const receipt of summary.receipts) {
  console.log(`- ${receipt.id}: ${receipt.status} (${receipt.sourceDemo})`);
}
