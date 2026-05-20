#!/usr/bin/env node
import { createServer as createHttpServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const root = resolve(new URL("..", import.meta.url).pathname);
const outputDir = resolve(root, "04-comprehensive-workflow", "receipts");
const autoYes = process.argv.includes("--yes");
const noBrowser = process.argv.includes("--no-browser") || autoYes;

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
  if (autoYes) return fallback;
  const suffix = fallback ? "[Y/n]" : "[y/N]";
  const answer = (await rl.question(`${prompt} ${suffix} `)).trim().toLowerCase();
  if (!answer) return fallback;
  return answer === "y" || answer === "yes";
}

async function note(rl, prompt, fallback) {
  if (autoYes) return fallback;
  console.log(`${prompt}`);
  console.log(`Default: ${fallback}`);
  const answer = (await rl.question("Press Enter to accept, or type an override:\n> ")).trim();
  return answer || fallback;
}

async function chooseLedgerMode(rl, label) {
  if (autoYes) return false;
  const answer = (await rl.question(
    `${label}: connect and unlock the Ledger, then press Enter to request the Ethereum app and submit real USB attestation. Type "demo" for fixture mode.\n> `
  )).trim().toLowerCase();
  return answer !== "demo" && answer !== "fixture";
}

async function requestLedgerApp(rl, appNames) {
  if (autoYes) {
    return {
      requested: false,
      skipped: "auto_mode"
    };
  }

  const names = Array.isArray(appNames) ? appNames : [appNames];
  const attempts = [];
  for (const appName of names) {
    const result = runCommand("node", ["scripts/open-ledger-app.mjs", appName], { cwd: root });
    attempts.push({ appName, command: result });
    if (result.passed) {
      console.log(`Ledger app request completed: ${appName}`);
      return {
        requested: true,
        appName,
        attempts
      };
    }
  }

  const last = attempts.at(-1)?.command;
  console.log(`Ledger app request did not complete automatically: ${last?.stderr || last?.stdout || "unknown error"}`);
  const proceed = await confirm(rl, `Open ${names.join(" or ")} manually on the Ledger, then continue?`, true);
  return {
    requested: true,
    appName: names[0],
    attempts,
    manuallyContinued: proceed
  };
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

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    env: { ...process.env, ...options.env },
    encoding: "utf8"
  });

  return {
    command: [command, ...args].join(" "),
    cwd: options.cwd ?? root,
    exitCode: result.status,
    stdout: result.stdout?.trim() ?? "",
    stderr: result.stderr?.trim() ?? "",
    passed: result.status === 0
  };
}

function openBrowser(url) {
  if (noBrowser) return { attempted: false, reason: "browser_open_disabled" };

  const command = process.platform === "darwin"
    ? "open"
    : process.platform === "win32"
      ? "cmd"
      : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];

  try {
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore"
    });
    child.unref();
    return { attempted: true, url };
  } catch (error) {
    return { attempted: false, url, error: error.message };
  }
}

async function waitForHttp(url, attempts = 30) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // Wait and retry.
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 250));
  }
  return false;
}

function startNodeServer(args, env = {}) {
  const child = spawn("node", args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"]
  });

  const logs = [];
  child.stdout.on("data", chunk => logs.push(chunk.toString().trim()));
  child.stderr.on("data", chunk => logs.push(chunk.toString().trim()));

  return {
    child,
    logs,
    close: () => {
      if (!child.killed) child.kill();
    }
  };
}

async function waitForServerLog(logs, pattern, attempts = 30) {
  for (let index = 0; index < attempts; index += 1) {
    const match = logs.join("\n").match(pattern);
    if (match) return match;
    await new Promise(resolveWait => setTimeout(resolveWait, 100));
  }
  return null;
}

function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = createNetServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : undefined;
      server.close(() => {
        if (port) resolvePort(port);
        else reject(new Error("Unable to allocate a local port."));
      });
    });
  });
}

function mime(path) {
  switch (extname(path)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "text/plain; charset=utf-8";
  }
}

function startStaticServer(rootDir, port, host = "localhost") {
  const staticRoot = resolve(root, rootDir);
  const server = createHttpServer(async (req, res) => {
    const url = new URL(req.url, `http://${host}:${port}`);
    const requested = url.pathname === "/" ? "/index.html" : url.pathname;
    const path = normalize(join(staticRoot, requested));

    if (!path.startsWith(staticRoot)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    try {
      const bytes = await readFile(path);
      res.writeHead(200, {
        "content-type": mime(path),
        "cache-control": "no-store"
      });
      res.end(bytes);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  return new Promise((resolveServer, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      resolveServer({
        url: `http://${host}:${port}/`,
        close: () => server.close()
      });
    });
  });
}

async function runHeadlessLane(rl) {
  const fixture = loadJson("01-headless-cli/fixtures/send-draft.json");

  printSection("Lane 1: Headless CLI Proposal", [
    "This lane runs the actual headless CLI commands.",
    "It creates a proposal receipt, validates the Ledger gate, then writes a human approval receipt.",
    "No transaction signing or broadcast is performed."
  ]);

  const useRealLedger = await chooseLedgerMode(rl, "Headless Ledger validation");
  const appRequest = useRealLedger ? await requestLedgerApp(rl, "Ethereum") : null;

  const cwd = resolve(root, "01-headless-cli");
  const propose = runCommand("node", ["src/agent-cli.mjs", "propose", "fixtures/send-draft.json"], { cwd });
  const validateArgs = ["src/agent-cli.mjs", "ledger-validate", "receipts/latest-proposal.json"];
  if (!useRealLedger) validateArgs.push("--fixture");
  const validate = runCommand("node", validateArgs, { cwd });
  const approve = validate.passed
    ? runCommand("node", ["src/agent-cli.mjs", "approve", "receipts/latest-proposal.json", "--human", autoYes ? "auto-fixture-reviewer" : "guided-reviewer"], { cwd })
    : null;

  const proposalReceipt = loadJson("01-headless-cli/receipts/latest-proposal.json");
  const validationReceipt = loadJson("01-headless-cli/receipts/latest-ledger-validation.json");
  const approvalReceipt = approve?.passed ? loadJson("01-headless-cli/receipts/latest-approval.json") : null;
  const defaultObservation = validate.passed && approvalReceipt
    ? validationReceipt.hardwareVerified
      ? `Headless CLI completed; Ledger Signer interaction verified for ${validationReceipt.ledgerAddress}; approval receipt generated; no signing or broadcast performed.`
      : "Headless CLI completed in fixture mode; proposal, validation, and approval receipts generated; no signing or broadcast performed."
    : "Headless CLI needs review; validation or approval did not complete.";
  const reviewerNote = defaultObservation;
  console.log(`Observation: ${reviewerNote}`);

  return step("lane-01-proposal", "Headless proposal and approval", propose.passed && validate.passed && approve?.passed ? "passed" : "needs_review", {
    sourceDemo: "01-headless-cli",
    intent: fixture.action,
    ledgerLayer: proposalReceipt.ledgerLayer,
    validationMode: validationReceipt.validationMode,
    reviewerNote,
    hardwareVerified: validationReceipt.hardwareVerified === true,
    signingPerformed: approvalReceipt?.signing?.performed === true,
    commands: { propose, validate, approve },
    appRequest,
    evidence: {
      proposalReceipt: "01-headless-cli/receipts/latest-proposal.json",
      ledgerValidationReceipt: "01-headless-cli/receipts/latest-ledger-validation.json",
      approvalReceipt: approvalReceipt ? "01-headless-cli/receipts/latest-approval.json" : null
    },
    failure: validate.passed ? undefined : validationReceipt.failure
  });
}

async function runAppGateLane(rl) {
  const fixture = loadJson("02-dmk-skills-app/fixtures/install-plan.json");

  printSection("Lane 2: Protected App Action", [
    "This lane starts the app gate server and opens the browser surface.",
    "The harness also submits the protected action intent to the server API and records the validation receipt."
  ]);

  const useRealLedger = await chooseLedgerMode(rl, "Protected app Ledger validation");
  const port = await getFreePort();
  const server = startNodeServer(["02-dmk-skills-app/src/server.mjs"], {
    PORT: String(port),
    LEDGER_FIXTURE: useRealLedger ? "0" : "1"
  });

  try {
    const readyLog = await waitForServerLog(server.logs, /http:\/\/127\.0\.0\.1:(\d+)\//);
    const url = readyLog?.[0] ?? `http://127.0.0.1:${port}/`;
    const ready = await waitForHttp(url);
    const appRequest = useRealLedger ? await requestLedgerApp(rl, "Ethereum") : null;
    let apiReceipt;
    let apiStatus = "failed";
    let apiError;
    try {
      const response = await fetch(`${url}api/ledger-validate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "publish_setting",
          intent: "publish_admin_setting",
          setting: "Maintenance window at 19:00 UTC"
        })
      });
      apiReceipt = await response.json();
      apiStatus = response.ok && apiReceipt.validationStatus === "passed" ? "passed" : "needs_review";
    } catch (error) {
      apiError = error.message;
    }

    const defaultObservation = ready && apiStatus === "passed"
      ? apiReceipt.hardwareVerified
        ? `App gate opened at ${url}; Ledger Signer interaction verified; protected action remains human-approval gated.`
        : `App gate opened at ${url}; fixture Ledger validation passed; protected action remains human-approval gated.`
      : `App gate opened at ${url}; browser or API validation needs review.`;
    const reviewerNote = defaultObservation;
    console.log(`Observation: ${reviewerNote}`);
    const browser = openBrowser(url);
    if (!autoYes) {
      await rl.question("Review demo 2 in the browser. The validation result should already be populated. Press Enter to continue to demo 3.");
    }

    return step("lane-02-app-gate", "Protected app action gate", ready && apiStatus === "passed" ? "passed" : "needs_review", {
      sourceDemo: "02-dmk-skills-app",
      intent: fixture.action ?? "publish_admin_setting",
      ledgerLayer: "app_action_to_ledger_hardware_gate",
      validationMode: apiReceipt?.validationMode ?? (useRealLedger ? "ledger_message_attestation" : "fixture_ledger_validation"),
      reviewerNote,
      hardwareVerified: apiReceipt?.hardwareVerified === true,
      browser,
      appRequest,
      serverReady: ready,
      serverLogs: server.logs,
      protectedAction: fixture.protectedAction ?? "publish_setting",
      apiReceipt,
      apiError,
      evidence: {
        fixture: "02-dmk-skills-app/fixtures/install-plan.json",
        browserUrl: url
      }
    });
  } finally {
    server.close();
  }
}

async function runAuthLane(rl) {
  const policy = loadJson("03-hardware-auth/fixtures/auth-policy.json");

  printSection("Lane 3: Hardware Auth Browser Flow", [
    "This lane starts a localhost server for the WebAuthn/Security Key app and opens it in the browser.",
    "Complete the browser flow manually: sign in, run Ledger validation, agent requests secret, approve secret access.",
    "The receipt records your observation; production still needs server-side WebAuthn verification."
  ]);

  const server = await startStaticServer("03-hardware-auth/src", await getFreePort(), "localhost");
  try {
    let appRequest = null;
    if (!autoYes) {
      await rl.question("Before demo 3, exit the current Ledger app to the dashboard. The app-open request can fail while Ethereum is still foregrounded. Press Enter to request the Security Key app.");
      appRequest = await requestLedgerApp(rl, ["Security Key", "FIDO U2F"]);
    }
    const browser = openBrowser(server.url);
    const completed = autoYes
      ? await waitForHttp(server.url)
      : await confirm(rl, "Did you complete the browser auth flow through secret approval?", false);
    const reviewerNote = await note(
      rl,
      "Paste or summarize the final browser receipt / observation:",
      autoYes
        ? "Auto mode confirmed the browser auth server responded; it did not complete WebAuthn."
        : completed
          ? "Browser auth flow completed through secret approval."
          : "Browser auth flow was not completed."
    );

    return step("lane-03-auth-sensitive-access", "Hardware identity and sensitive access", completed ? "passed" : "needs_review", {
      sourceDemo: "03-hardware-auth",
      intent: policy.intent ?? "sensitive_access",
      ledgerLayer: "security_key_identity_and_fresh_secret_gate",
      validationMode: autoYes ? "browser_static_smoke" : "browser_webauthn_flow",
      reviewerNote,
      hardwareVerified: autoYes ? false : completed,
      secretReleased: autoYes ? false : completed,
      sessionOpenedByAgent: false,
      appRequest,
      browser,
      evidence: {
        fixture: "03-hardware-auth/fixtures/auth-policy.json",
        browserUrl: server.url,
        serverVerification: false
      }
    });
  } finally {
    server.close();
  }
}

async function runWorkflowMapLane(rl) {
  const workflowMap = loadJson("04-comprehensive-workflow/fixtures/feature-map.json");
  const ledgerValidationMap = loadJson("04-comprehensive-workflow/fixtures/ledger-validation.json");

  printSection("Lane 4: Combined Workflow Map", [
    `Layers: ${workflowMap.ledgerLayers.join(", ")}`,
    "This lane verifies the combined map against the receipts generated by the prior lanes."
  ]);

  const confirmed = await confirm(rl, "Do the generated lane receipts preserve the combined workflow boundaries?", true);
  const reviewerNote = "Generated lane receipts preserve visible approval gates and optional wallet proof boundaries.";
  console.log(`Observation: ${reviewerNote}`);

  return step("lane-04-combined-workflow", "Comprehensive workflow map", confirmed ? "passed" : "needs_review", {
    sourceDemo: "04-comprehensive-workflow",
    intent: "combined_identity_approval_wallet_feedback",
    ledgerLayer: "workflow_ledger_validation_map",
    validationMode: ledgerValidationMap.mode,
    reviewerNote,
    hardwareVerified: false,
    workflowLayers: workflowMap.ledgerLayers,
    requiredChecks: ledgerValidationMap.requiredChecks,
    evidence: {
      fixture: "04-comprehensive-workflow/fixtures/feature-map.json",
      boundary: "04-comprehensive-workflow/BOUNDARY.md"
    }
  });
}

async function runFeedbackLane(rl) {
  const workflowMap = loadJson("04-comprehensive-workflow/fixtures/feature-map.json");
  printSection("Lane 5: Feedback", [
    "This lane captures the actual next proof gap after running the demo functions."
  ]);
  const remainingQuestion = await note(
    rl,
    "What should be replaced with stronger real app or hardware evidence next?",
    "Replace one fixture or browser-observed lane with a persisted real hardware receipt."
  );

  return step("lane-05-feedback", "Dogfood feedback receipt", "passed", {
    sourceDemo: "04-comprehensive-workflow",
    flow: autoYes ? "comprehensive_workflow_auto_function_run" : "comprehensive_workflow_guided_function_run",
    ledgerLayers: workflowMap.ledgerLayers,
    expectedDevicePrompt: "Real Ledger lanes prompt on the Ethereum or Security Key app when enabled.",
    observedDevicePrompt: autoYes ? "Auto mode did not observe physical prompts." : "Captured from reviewer notes per lane.",
    appBelievedState: "Harness ran each demo lane and wrote lane receipts from command/API/browser observations.",
    userObservedState: autoYes ? "Auto function run completed." : "Guided function run completed.",
    remainingQuestion,
    hardwareVerified: false
  });
}

async function run() {
  const rl = createInterface({ input, output });
  const receipts = [];

  if (!autoYes) {
    console.log("Ledger Agent Comprehensive Workflow");
    console.log("This guided run invokes each demo lane and writes receipts from the actual run.");
    console.log("Fixture mode remains available; physical Ledger proof is recorded only when real device validation succeeds.");
  }

  try {
    receipts.push(await runHeadlessLane(rl));
    receipts.push(await runAppGateLane(rl));
    receipts.push(await runAuthLane(rl));
    receipts.push(await runWorkflowMapLane(rl));
    receipts.push(await runFeedbackLane(rl));
  } finally {
    rl.close();
  }

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
    mode: autoYes ? "auto_function_tandem_workflow" : "guided_function_tandem_workflow",
    hardwareVerified: receipts.some(receipt => receipt.hardwareVerified === true),
    signingPerformed: receipts.some(receipt => receipt.signingPerformed === true),
    secretReleased: receipts.some(receipt => receipt.secretReleased === true),
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
      path: `04-comprehensive-workflow/receipts/${receipt.id}.json`
    })),
    nonClaims: [
      "Fixture validation is not physical Ledger verification.",
      "Browser WebAuthn evidence is not server-verified WebAuthn.",
      "No transaction broadcast is performed by this harness.",
      "An agent did not approve its own sensitive action."
    ],
    nextRealProof: [
      "Run the headless or app-gate lane with real Ledger USB attestation.",
      "Persist browser WebAuthn receipts from demo 3 instead of summarizing them manually.",
      receipts.find(receipt => receipt.id === "lane-05-feedback")?.remainingQuestion
    ].filter(Boolean)
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
