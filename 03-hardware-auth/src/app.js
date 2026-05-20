const sessionStatus = document.querySelector("#session-status");
const signin = document.querySelector("#signin");
const validateSession = document.querySelector("#validate-session");
const requestSecret = document.querySelector("#request-secret");
const approveSecret = document.querySelector("#approve-secret");
const summary = document.querySelector("#summary");
const receipt = document.querySelector("#receipt");
const guidedStart = document.querySelector("#guided-start");

const credentialStorageKey = "hardware-auth-demo-credential-id";

let sessionOpened = false;
let ledgerValidated = false;
let secretRequested = false;
let webAuthnAttempted = false;
let credentialId = loadCredentialId();

function bytes(length) {
  const value = new Uint8Array(length);
  crypto.getRandomValues(value);
  return value;
}

function bufferToBase64Url(buffer) {
  const bytesValue = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytesValue) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBuffer(value) {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const binary = atob(padded.replaceAll("-", "+").replaceAll("_", "/"));
  const bytesValue = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytesValue[index] = binary.charCodeAt(index);
  }
  return bytesValue.buffer;
}

function loadCredentialId() {
  return localStorage.getItem(credentialStorageKey);
}

function saveCredentialId(rawId) {
  credentialId = bufferToBase64Url(rawId);
  localStorage.setItem(credentialStorageKey, credentialId);
}

function credentialLabel() {
  return credentialId ? `${credentialId.slice(0, 12)}...` : null;
}

function requireWebAuthn() {
  if (!navigator.credentials?.create || !navigator.credentials?.get) {
    throw new Error("WebAuthn is not available. Serve this demo on localhost in a modern browser.");
  }
}

async function registerOrSignIn() {
  requireWebAuthn();
  webAuthnAttempted = true;

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: bytes(32),
      rp: { name: "Hardware Auth Scaffold" },
      user: {
        id: bytes(16),
        name: "demo@example.com",
        displayName: "Demo Reviewer"
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: {
        authenticatorAttachment: "cross-platform",
        residentKey: "preferred",
        userVerification: "preferred"
      },
      timeout: 60000,
      attestation: "none"
    }
  });

  saveCredentialId(credential.rawId);
  return credential;
}

async function confirmWithSecurityKey(reason) {
  requireWebAuthn();
  if (!credentialId) {
    throw new Error("Register or sign in with the Security Key before this step.");
  }

  return navigator.credentials.get({
    publicKey: {
      challenge: bytes(32),
      allowCredentials: [
        {
          id: base64UrlToBuffer(credentialId),
          type: "public-key",
          transports: ["usb", "nfc"]
        }
      ],
      userVerification: "preferred",
      timeout: 60000
    },
    mediation: "optional"
  }).then(assertion => ({
    reason,
    credentialId: assertion.id,
    responseType: assertion.type
  }));
}

function buildReceipt(extra) {
  return {
    sessionOpened,
    ledgerValidated,
    secretRequested,
    ledgerLayer: "security_key_identity_and_fresh_secret_gate",
    agentCreatedSession: false,
    webAuthnAttempted,
    credentialId: credentialLabel(),
    serverVerified: false,
    ...extra,
    createdAt: new Date().toISOString()
  };
}

function renderSummary(payload) {
  if (payload.status === "failed") {
    summary.textContent = [
      "Hardware authentication failed.",
      payload.failure?.message ?? "See JSON receipt for details.",
      "No new access was granted."
    ].join(" ");
    return;
  }

  if (payload.sensitiveAction === "secret_access_approved") {
    summary.textContent = [
      "Secret access approved after session authentication, Ledger validation, and fresh Security Key approval.",
      "The agent did not create the session.",
      "This demo captured client-side WebAuthn evidence; production apps still need server verification."
    ].join(" ");
    return;
  }

  if (payload.sensitiveAction === "agent_requested_secret") {
    summary.textContent = "The agent requested the secret, but the secret is still blocked until a fresh Security Key approval is completed.";
    return;
  }

  if (payload.validationStatus === "passed") {
    summary.textContent = [
      "Ledger Security Key validation passed for sensitive access.",
      "The agent can now request the secret, but cannot approve access by itself.",
      "Production apps still need server-side WebAuthn verification."
    ].join(" ");
    return;
  }

  if (payload.sessionOpened) {
    summary.textContent = [
      "Security Key session opened.",
      "Ledger validation is still required before sensitive access."
    ].join(" ");
    return;
  }

  summary.textContent = "Receipt recorded. See JSON for details.";
}

function renderReceipt(extra) {
  const payload = buildReceipt(extra);
  renderSummary(payload);
  receipt.textContent = JSON.stringify(payload, null, 2);
}

function renderFailure(action, error) {
  renderReceipt({
    action,
    status: "failed",
    hardwareVerified: false,
    failure: {
      name: error.name,
      message: error.message
    }
  });
}

signin.addEventListener("click", async () => {
  try {
    sessionStatus.textContent = "Waiting for Security Key registration/sign-in...";
    const credential = await registerOrSignIn();
    sessionOpened = true;
    ledgerValidated = false;
    secretRequested = false;
    validateSession.disabled = false;
    requestSecret.disabled = true;
    approveSecret.disabled = true;
    sessionStatus.textContent = "Security Key session opened.";
    renderReceipt({
      action: "security_key_session_opened",
      sessionMode: "webauthn_security_key",
      hardwareVerified: true,
      webAuthnCredentialType: credential.type,
      webAuthnServerVerified: false
    });
  } catch (error) {
    sessionOpened = false;
    validateSession.disabled = true;
    requestSecret.disabled = true;
    approveSecret.disabled = true;
    sessionStatus.textContent = "Security Key session failed.";
    renderFailure("security_key_session_failed", error);
  }
});

validateSession.addEventListener("click", async () => {
  if (!sessionOpened) return;

  try {
    const assertion = await confirmWithSecurityKey("validate_sensitive_access");
    ledgerValidated = true;
    requestSecret.disabled = false;
    renderReceipt({
      action: "validate_sensitive_access",
      validationMode: "webauthn_security_key_assertion",
      validationStatus: "passed",
      hardwareVerified: true,
      webAuthnAssertionType: assertion.responseType,
      webAuthnServerVerified: false,
      expectedDevicePrompt: "Ledger Security Key confirms user presence for sensitive access"
    });
  } catch (error) {
    ledgerValidated = false;
    requestSecret.disabled = true;
    approveSecret.disabled = true;
    renderFailure("validate_sensitive_access_failed", error);
  }
});

requestSecret.addEventListener("click", () => {
  if (!sessionOpened || !ledgerValidated) return;
  secretRequested = true;
  approveSecret.disabled = false;
  renderReceipt({
    sensitiveAction: "agent_requested_secret",
    secretGate: "fresh_security_key_approval_required",
    secretReleased: false
  });
});

approveSecret.addEventListener("click", async () => {
  if (!secretRequested) return;

  try {
    const assertion = await confirmWithSecurityKey("approve_secret_access");
    renderReceipt({
      sensitiveAction: "secret_access_approved",
      secretGate: "fresh_security_key_approval_completed",
      hardwareVerified: true,
      webAuthnAssertionType: assertion.responseType,
      webAuthnServerVerified: false,
      secretReleased: true,
      decryptedValue: "demo-secret-placeholder"
    });
  } catch (error) {
    renderFailure("approve_secret_access_failed", error);
  }
});

function applyGuidedStart() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("guided") !== "session") return;

  guidedStart.hidden = false;
  sessionStatus.textContent = "Security Key app request was staged by the CLI. Complete Register/sign in to open the browser session.";
  signin.focus();
}

applyGuidedStart();
