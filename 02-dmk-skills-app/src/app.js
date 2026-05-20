let ledgerValidated = false;
let hardwareApproved = false;
let validationReceipt = null;

const setting = document.querySelector("#setting");
const validate = document.querySelector("#validate");
const approve = document.querySelector("#approve");
const publish = document.querySelector("#publish");
const gateStatus = document.querySelector("#gate-status");
const protectedAction = document.querySelector("#protected-action");
const summary = document.querySelector("#summary");
const receipt = document.querySelector("#receipt");

function renderReceipt(payload) {
  receipt.textContent = JSON.stringify(payload, null, 2);
}

function renderSummary(payload) {
  if (!payload) {
    summary.textContent = "No gate result yet.";
    return;
  }

  if (payload.validationStatus === "pending") {
    summary.textContent = "Ledger validation is waiting for the device prompt. Keep the Ledger unlocked with the Ethereum app open.";
    return;
  }

  if (payload.validationStatus === "failed") {
    summary.textContent = [
      "Ledger validation failed.",
      payload.failure?.message ?? "See JSON receipt for details.",
      "The protected action remains blocked."
    ].join(" ");
    return;
  }

  if (payload.action === "publish_setting") {
    summary.textContent = [
      "Protected action published after Ledger validation and human approval.",
      payload.hardwareVerified ? `Hardware attested by ${payload.ledgerAddress}.` : "Fixture validation was used; no hardware verification was captured.",
      `Setting: ${payload.setting}`
    ].join(" ");
    return;
  }

  if (payload.validationStatus === "passed") {
    summary.textContent = [
      "Ledger validation passed.",
      payload.hardwareVerified ? `Hardware attested by ${payload.ledgerAddress}.` : "Fixture validation was used; no hardware verification was captured.",
      "Human approval is still required before publishing."
    ].join(" ");
    return;
  }

  summary.textContent = "Gate result recorded. See JSON receipt for details.";
}

function renderProtectedAction(payload) {
  if (!payload) {
    protectedAction.textContent = "Protected action: waiting for Ledger validation.";
    return;
  }

  if (payload.validationStatus === "pending") {
    protectedAction.textContent = "Protected action: publish remains locked while Ledger validation is pending.";
    return;
  }

  if (payload.validationStatus === "failed") {
    protectedAction.textContent = "Protected action: publish is blocked because Ledger validation failed.";
    return;
  }

  if (payload.action === "publish_setting") {
    protectedAction.textContent = `Protected action: published "${payload.setting}" after validation and human approval.`;
    return;
  }

  if (payload.validationStatus === "passed") {
    protectedAction.textContent = "Protected action: Ledger validation passed; human approval is required before publish unlocks.";
    return;
  }

  protectedAction.textContent = "Protected action: state recorded in the agent-readable receipt.";
}

function renderGateResult(payload) {
  renderProtectedAction(payload);
  renderSummary(payload);
  renderReceipt(payload);
}

validate.addEventListener("click", async () => {
  ledgerValidated = false;
  hardwareApproved = false;
  approve.disabled = true;
  publish.disabled = true;
  gateStatus.textContent = "Status: waiting for Ledger validation";
  renderGateResult({
    action: "validate_publish_setting_intent",
    validationStatus: "pending",
    expectedDevicePrompt: "Open the Ethereum app on the connected Ledger and approve the dry-run message signing prompt."
  });

  try {
    const response = await fetch("/api/ledger-validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "publish_setting",
        intent: "publish_admin_setting",
        setting: setting.value
      })
    });
    validationReceipt = await response.json();
    renderGateResult(validationReceipt);

    if (!response.ok || validationReceipt.validationStatus !== "passed") {
      gateStatus.textContent = `Status: Ledger validation failed - ${validationReceipt.failure?.message ?? "see receipt"}`;
      return;
    }

    ledgerValidated = true;
    gateStatus.textContent = validationReceipt.hardwareVerified
      ? "Status: Ledger device attestation captured; approval still required"
      : "Status: fixture Ledger validation passed; approval still required";
    approve.disabled = false;
  } catch (error) {
    gateStatus.textContent = "Status: Ledger validation server unavailable";
    renderGateResult({
      action: "validate_publish_setting_intent",
      validationStatus: "failed",
      hardwareVerified: false,
      failure: {
        message: "Start the local demo server with `npm run demo:dmk` from the Agent-Demos root.",
        detail: error.message
      }
    });
  }
});

approve.addEventListener("click", () => {
  if (!ledgerValidated) return;
  hardwareApproved = true;
  gateStatus.textContent = "Status: simulated Ledger approval captured";
  protectedAction.textContent = "Protected action: human approval captured; publish is now available.";
  publish.disabled = false;
});

publish.addEventListener("click", () => {
  if (!hardwareApproved) return;

  const approvalReceipt = {
    action: "publish_setting",
    ledgerLayer: "app_action_to_ledger_hardware_gate",
    setting: setting.value,
    approvedBy: "local-demo-reviewer",
    validationMode: validationReceipt?.validationMode,
    validationStatus: validationReceipt?.validationStatus,
    ledgerAddress: validationReceipt?.ledgerAddress,
    approvalMode: "simulated-ledger-gate",
    hardwareVerified: validationReceipt?.hardwareVerified === true,
    createdAt: new Date().toISOString()
  };

  renderGateResult(approvalReceipt);
});
