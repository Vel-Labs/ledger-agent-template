#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const root = resolve(new URL("..", import.meta.url).pathname);
const outputDir = resolve(root, "04-comprehensive-workflow", "receipts");
const autoYes = process.argv.includes("--yes");

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

function printSection(title, lines) {
  console.log("");
  console.log(`== ${title} ==`);
  for (const line of lines) console.log(line);
}

async function confirm(rl, prompt, fallback = true) {
  if (autoYes) return true;
  const suffix = fallback ? "[Y/n]" : "[y/N]";
  const answer = (await rl.question(`${prompt} ${suffix} `)).trim().toLowerCase();
  if (!answer) return fallback;
  return answer === "y" || answer === "yes";
}

async function note(rl, prompt, fallback) {
  if (autoYes) return fallback;
  const answer = (await rl.question(`${prompt}\n> `)).trim();
  return answer || fallback;
}

function step(id, title, status, payload) {
  return {
    id,
    title,
    status,
    ...payload,
    createdAt: now()
  };
}

async function run() {
  const rl = createInterface({ input, output });
  const headlessFixture = loadJson("01-headless-cli/fixtures/send-draft.json");
  const dmkFixture = loadJson("02-dmk-skills-app/fixtures/install-plan.json");
  const authPolicy = loadJson("03-hardware-auth/fixtures/auth-policy.json");
  const workflowMap = loadJson("04-comprehensive-workflow/fixtures/feature-map.json");
  const ledgerValidationMap = loadJson("04-comprehensive-workflow/fixtures/ledger-validation.json");

  if (!autoYes) {
    console.log("Ledger Agent Comprehensive Workflow");
    console.log("This guided run writes receipts only after you acknowledge each lane.");
    console.log("Fixture acknowledgements are not physical Ledger proof.");
  }

  const receipts = [];

  printSection("Lane 1: Headless Proposal", [
    "Inspect: 01-headless-cli/fixtures/send-draft.json",
    `Intent: ${headlessFixture.action}`,
    "Expected boundary: proposal is visible, approval is required, signing is blocked."
  ]);
  const lane1Passed = await confirm(rl, "Did you inspect the proposal lane and confirm signing remains blocked?");
  const lane1Note = await note(rl, "Reviewer note for lane 1:", "Fixture proposal inspected; signing remains blocked.");
  receipts.push(step("lane-01-proposal", "Headless proposal and approval", lane1Passed ? "passed" : "needs_review", {
    sourceDemo: "01-headless-cli",
    intent: headlessFixture.action,
    ledgerLayer: headlessFixture.ledgerLayer,
    validationMode: "fixture_ledger_validation",
    reviewerAcknowledged: lane1Passed,
    reviewerNote: lane1Note,
    hardwareVerified: false,
    signing: {
      performed: false,
      blockedUntil: "human_approval_and_physical_ledger_confirmation"
    },
    evidence: {
      fixture: "01-headless-cli/fixtures/send-draft.json",
      comparableReceipt: "01-headless-cli/receipts/latest-proposal.json"
    }
  }));

  printSection("Lane 2: Protected App Action", [
    "Inspect: 02-dmk-skills-app/fixtures/install-plan.json",
    "Optional browser run: npm run demo:dmk:fixture",
    "Expected boundary: protected publish waits for Ledger-shaped validation and human approval."
  ]);
  const lane2Passed = await confirm(rl, "Did you inspect the app-gate lane and confirm the protected action remains gated?");
  const lane2Note = await note(rl, "Reviewer note for lane 2:", "Fixture app gate inspected; publish remains approval-gated.");
  receipts.push(step("lane-02-app-gate", "Protected app action gate", lane2Passed ? "passed" : "needs_review", {
    sourceDemo: "02-dmk-skills-app",
    intent: dmkFixture.action ?? "publish_admin_setting",
    ledgerLayer: "app_action_to_ledger_hardware_gate",
    validationMode: "fixture_ledger_validation",
    reviewerAcknowledged: lane2Passed,
    reviewerNote: lane2Note,
    hardwareVerified: false,
    protectedAction: dmkFixture.protectedAction ?? "publish_setting",
    evidence: {
      fixture: "02-dmk-skills-app/fixtures/install-plan.json",
      runnableSurface: "npm run demo:dmk:fixture"
    }
  }));

  printSection("Lane 3: Identity And Sensitive Access", [
    "Inspect: 03-hardware-auth/fixtures/auth-policy.json",
    "Expected boundary: agent cannot create the session or approve secret access by itself.",
    "Production note: browser WebAuthn evidence is not server verification."
  ]);
  const lane3Passed = await confirm(rl, "Did you confirm the auth lane preserves human/session control?");
  const lane3Note = await note(rl, "Reviewer note for lane 3:", "Fixture auth policy inspected; agent-created session remains false.");
  receipts.push(step("lane-03-auth-sensitive-access", "Hardware identity and sensitive access", lane3Passed ? "passed" : "needs_review", {
    sourceDemo: "03-hardware-auth",
    intent: authPolicy.intent ?? "sensitive_access",
    ledgerLayer: "security_key_identity_and_fresh_secret_gate",
    sessionOpenedByAgent: false,
    validationMode: "demo_fallback",
    reviewerAcknowledged: lane3Passed,
    reviewerNote: lane3Note,
    hardwareVerified: false,
    secretReleased: false,
    evidence: {
      fixture: "03-hardware-auth/fixtures/auth-policy.json",
      browserSurface: "03-hardware-auth/src/index.html"
    }
  }));

  printSection("Lane 4: Combined Workflow Map", [
    "Inspect: 04-comprehensive-workflow/fixtures/feature-map.json",
    `Layers: ${workflowMap.ledgerLayers.join(", ")}`,
    "Expected boundary: wallet proof is optional and action-specific."
  ]);
  const lane4Passed = await confirm(rl, "Did you confirm the combined map preserves the individual lane boundaries?");
  const lane4Note = await note(rl, "Reviewer note for lane 4:", "Workflow map inspected; wallet proof remains optional.");
  receipts.push(step("lane-04-combined-workflow", "Comprehensive workflow map", lane4Passed ? "passed" : "needs_review", {
    sourceDemo: "04-comprehensive-workflow",
    intent: "combined_identity_approval_wallet_feedback",
    ledgerLayer: "workflow_ledger_validation_map",
    validationMode: ledgerValidationMap.mode,
    reviewerAcknowledged: lane4Passed,
    reviewerNote: lane4Note,
    hardwareVerified: false,
    workflowLayers: workflowMap.ledgerLayers,
    requiredChecks: ledgerValidationMap.requiredChecks,
    evidence: {
      fixture: "04-comprehensive-workflow/fixtures/feature-map.json",
      boundary: "04-comprehensive-workflow/BOUNDARY.md"
    }
  }));

  printSection("Lane 5: Dogfood Feedback", [
    "This lane records what remains unresolved after the fixture walkthrough.",
    "Use it to choose the next real proof lane."
  ]);
  const remainingQuestion = await note(
    rl,
    "What should be replaced with real app or hardware evidence next?",
    "Replace one fixture receipt with physical Ledger or server-verified evidence."
  );
  receipts.push(step("lane-05-feedback", "Dogfood feedback receipt", "passed", {
    sourceDemo: "04-comprehensive-workflow",
    flow: autoYes ? "comprehensive_workflow_auto_fixture_run" : "comprehensive_workflow_guided_fixture_run",
    ledgerLayers: workflowMap.ledgerLayers,
    expectedDevicePrompt: "Each sensitive lane names the Ledger or Security Key prompt that a real implementation must show.",
    observedDevicePrompt: "Fixture run only; no physical prompt observed.",
    appBelievedState: "Scaffold lanes were reviewed against their fixture contract and remain blocked from hidden signing or secret release.",
    userObservedState: autoYes ? "Auto fixture run generated from local fixtures." : "Guided reviewer walkthrough completed.",
    remainingQuestion,
    hardwareVerified: false
  }));

  rl.close();

  for (const receipt of receipts) {
    writeReceipt(`${receipt.id}.json`, receipt);
  }

  const allRequiredPassed = receipts
    .filter(receipt => receipt.id !== "lane-05-feedback")
    .every(receipt => receipt.status === "passed");

  const summary = {
    id: `comprehensive-workflow-${Date.now()}`,
    createdAt: now(),
    status: allRequiredPassed ? "passed" : "needs_review",
    mode: autoYes ? "auto_fixture_tandem_workflow" : "guided_fixture_tandem_workflow",
    hardwareVerified: false,
    signingPerformed: false,
    secretReleased: false,
    reviewerGuided: !autoYes,
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
      reviewerAcknowledged: receipt.reviewerAcknowledged,
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
      remainingQuestion
    ]
  };

  const summaryPath = writeReceipt("latest-comprehensive-workflow.json", summary);

  console.log("");
  console.log(`Comprehensive workflow receipt written: ${summaryPath}`);
  for (const receipt of summary.receipts) {
    console.log(`- ${receipt.id}: ${receipt.status} (${receipt.sourceDemo})`);
  }
}

run().catch(error => {
  console.error(error.message);
  process.exit(1);
});
