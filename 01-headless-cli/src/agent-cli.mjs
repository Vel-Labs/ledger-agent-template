#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, resolve } from "node:path";

const [, , command, inputPath, ...args] = process.argv;
const receiptsDir = resolve("receipts");
const require = createRequire(import.meta.url);

function usage() {
  console.log("Usage:");
  console.log("  node src/agent-cli.mjs propose fixtures/send-draft.json");
  console.log("  node src/agent-cli.mjs ledger-validate receipts/latest-proposal.json");
  console.log("  node src/agent-cli.mjs ledger-validate receipts/latest-proposal.json --fixture");
  console.log("  node src/agent-cli.mjs ledger-validate receipts/latest-proposal.json --path \"44'/60'/0'/0/0\"");
  console.log("  node src/agent-cli.mjs approve receipts/latest-proposal.json --human \"name\"");
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeReceipt(name, payload) {
  mkdirSync(receiptsDir, { recursive: true });
  const path = resolve(receiptsDir, name);
  writeFileSync(path, JSON.stringify(payload, null, 2) + "\n");
  return path;
}

function now() {
  return new Date().toISOString();
}

function hasFlag(name) {
  return args.includes(name);
}

function optionValue(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
}

function buildAttestationMessage(proposal) {
  const preview = proposal.preview ?? {};
  return [
    "DRY RUN LEDGER ATTESTATION ONLY",
    "No transaction signing or broadcast.",
    `Proposal: ${proposal.id}`,
    `Intent: ${proposal.action}`,
    `Network: ${preview.network ?? "unknown"}`,
    `Asset: ${preview.asset ?? "unknown"}`,
    `Amount: ${preview.amount ?? "unknown"}`,
    `To: ${preview.to ?? "unknown"}`
  ].join("\n");
}

function buildLedgerValidationReceipt(proposal, overrides = {}) {
  return {
    id: `ledger-validation-${Date.now()}`,
    validatedAt: now(),
    proposalId: proposal.id,
    action: proposal.action,
    intent: proposal.action,
    ledgerLayer: proposal.ledgerLayer ?? "proposal_to_ledger_signing_gate",
    mode: overrides.mode,
    validationMode: overrides.validationMode,
    status: overrides.status ?? "passed",
    validationStatus: overrides.validationStatus ?? "passed",
    hardwareVerified: overrides.hardwareVerified,
    ledgerAddress: overrides.ledgerAddress,
    derivationPath: overrides.derivationPath,
    attestationMessage: overrides.attestationMessage,
    attestationSignature: overrides.attestationSignature,
    expectedDevicePrompt: proposal.ledgerValidation?.expectedDevicePrompt ?? "Review operation on Ledger device",
    failure: overrides.failure,
    checked: {
      dryRunRequired: proposal.dryRun === true,
      approvalRequired: proposal.approval?.required === true,
      signingBlocked: proposal.signing?.performed === false,
      expectedDevicePrompt: proposal.ledgerValidation?.expectedDevicePrompt ?? "Review operation on Ledger device"
    },
    nextGate: overrides.nextGate
  };
}

function ledgerFailureMessage(error) {
  const statusText = error?.statusText;
  const statusCode = error?.statusCode;
  const message = error?.message ?? "Unknown Ledger error";

  if (statusText === "LOCKED_DEVICE" || statusCode === 0x5515) {
    return "Ledger is locked. Unlock the device and open the Ethereum app, then rerun ledger-validate.";
  }

  if (statusText === "UNKNOWN_APDU" || statusCode === 0x6d00) {
    return "Ledger app did not accept the Ethereum command. Open the Ethereum app and rerun ledger-validate.";
  }

  return message;
}

async function runLedgerAttestation(proposal) {
  const derivationPath = optionValue("--path", "44'/60'/0'/0/0");
  const attestationMessage = buildAttestationMessage(proposal);

  let TransportNodeHid;
  let Eth;
  try {
    TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
    Eth = require("@ledgerhq/hw-app-eth").default;
  } catch (error) {
    console.error("Ledger dependencies are missing. Run `npm install` from the Agent-Demos root.");
    console.error(error.message);
    process.exit(1);
  }

  console.log("Open the Ethereum app on the USB-connected Ledger.");
  console.log("Confirm the message-signing prompt on the device.");
  console.log("This signs a dry-run attestation message, not a transaction.");

  const transport = await TransportNodeHid.create();
  try {
    const eth = new Eth(transport);
    const address = await eth.getAddress(derivationPath, false);
    const messageHex = Buffer.from(attestationMessage, "utf8").toString("hex");
    const signature = await eth.signPersonalMessage(derivationPath, messageHex);

    return buildLedgerValidationReceipt(proposal, {
      mode: "ledger_message_attestation",
      validationMode: "ledger_message_attestation",
      hardwareVerified: true,
      ledgerAddress: address.address,
      derivationPath,
      attestationMessage,
      attestationSignature: {
        v: signature.v,
        r: signature.r,
        s: signature.s
      },
      nextGate: "human_approval_then_physical_ledger_transaction_confirmation_for_real_signing"
    });
  } finally {
    await transport.close();
  }
}

function runFixtureValidation(proposal) {
  const validation = buildLedgerValidationReceipt(proposal, {
    mode: "fixture_ledger_validation",
    validationMode: "fixture_ledger_validation",
    hardwareVerified: false,
    nextGate: "human_approval_then_physical_ledger_confirmation_for_real_signing"
  });

  if (!validation.checked.dryRunRequired || !validation.checked.approvalRequired || !validation.checked.signingBlocked) {
    validation.status = "failed";
    validation.validationStatus = "failed";
  }

  return validation;
}

if (!command || !inputPath) {
  usage();
  process.exit(1);
}

if (command === "propose") {
  const fixture = loadJson(inputPath);
  const proposal = {
    id: `proposal-${Date.now()}`,
    createdAt: now(),
    sourceFixture: basename(inputPath),
    action: fixture.action,
    ledgerLayer: fixture.ledgerLayer ?? "proposal_to_ledger_signing_gate",
    dryRun: fixture.dryRun !== false,
    preview: {
      network: fixture.network,
      asset: fixture.asset,
      amount: fixture.amount,
      to: fixture.to,
      memo: fixture.memo
    },
    agentReason: fixture.agentReason,
    riskNotes: fixture.riskNotes ?? [],
    approval: {
      required: true,
      status: "pending_human_review"
    },
    ledgerValidation: {
      required: true,
      status: "pending_ledger_message_attestation",
      expectedDevicePrompt: fixture.expectedDevicePrompt ?? "Review operation on Ledger device"
    },
    signing: {
      status: "blocked_until_human_approval",
      performed: false
    },
    hardware: {
      ledgerRequiredForRealSigning: true,
      verified: false,
      mode: "dry_run_proposal_requires_ledger_attestation"
    }
  };
  const path = writeReceipt("latest-proposal.json", proposal);
  console.log(`Proposal written: ${path}`);
  console.log("Signing status: blocked_until_human_approval");
  process.exit(0);
}

if (command === "ledger-validate") {
  const proposal = loadJson(inputPath);
  let validation;
  try {
    validation = hasFlag("--fixture")
      ? runFixtureValidation(proposal)
      : await runLedgerAttestation(proposal);
  } catch (error) {
    validation = buildLedgerValidationReceipt(proposal, {
      mode: "ledger_message_attestation",
      validationMode: "ledger_message_attestation",
      status: "failed",
      validationStatus: "failed",
      hardwareVerified: false,
      nextGate: "unlock_ledger_open_ethereum_app_and_retry",
      failure: {
        statusText: error?.statusText,
        statusCode: error?.statusCode,
        message: ledgerFailureMessage(error)
      }
    });
  }

  const path = writeReceipt("latest-ledger-validation.json", validation);
  console.log(`Ledger validation receipt written: ${path}`);
  console.log(`Ledger validation status: ${validation.status}`);
  if (validation.failure?.message) {
    console.error(validation.failure.message);
  }
  process.exit(validation.status === "passed" ? 0 : 1);
}

if (command === "approve") {
  const humanFlagIndex = args.indexOf("--human");
  const human = humanFlagIndex >= 0 ? args[humanFlagIndex + 1] : undefined;
  if (!human) {
    console.error("Missing --human \"name\"");
    process.exit(1);
  }
  const proposal = loadJson(inputPath);
  let validation;
  try {
    validation = loadJson(resolve(receiptsDir, "latest-ledger-validation.json"));
  } catch {
    console.error("Run ledger-validate before approve.");
    process.exit(1);
  }
  if (validation.proposalId !== proposal.id || validation.status !== "passed") {
    console.error("Ledger validation receipt missing or not passed for this proposal.");
    process.exit(1);
  }
  const receipt = {
    id: `approval-${Date.now()}`,
    approvedAt: now(),
    proposalId: proposal.id,
    approvedBy: human,
    approvedAction: proposal.action,
    ledgerLayer: proposal.ledgerLayer ?? "proposal_to_ledger_signing_gate",
    ledgerValidationId: validation.id,
    dryRun: proposal.dryRun,
    hardwareVerified: validation.hardwareVerified === true,
    signing: {
      status: "not_performed",
      performed: false,
      nextGate: "physical_ledger_confirmation_required"
    }
  };
  const path = writeReceipt("latest-approval.json", receipt);
  console.log(`Approval receipt written: ${path}`);
  console.log("No signing was performed.");
  process.exit(0);
}

usage();
process.exit(1);
