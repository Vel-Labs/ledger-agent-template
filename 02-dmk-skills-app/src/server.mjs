#!/usr/bin/env node
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT ?? 8022);
const fixtureMode = process.env.LEDGER_FIXTURE === "1";

function now() {
  return new Date().toISOString();
}

function json(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(body, null, 2));
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

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolveBody(body ? JSON.parse(body) : {}));
    req.on("error", reject);
  });
}

function attestationMessage(intent) {
  return [
    "DRY RUN LEDGER APP GATE ATTESTATION ONLY",
    "No transaction signing or broadcast.",
    `Intent: ${intent.intent}`,
    `Action: ${intent.action}`,
    `Setting: ${intent.setting}`
  ].join("\n");
}

function ledgerFailureMessage(error) {
  if (error?.statusText === "LOCKED_DEVICE" || error?.statusCode === 0x5515) {
    return "Ledger is locked. Unlock the device and open the Ethereum app, then run Ledger validation again.";
  }
  if (error?.statusText === "UNKNOWN_APDU" || error?.statusCode === 0x6d00) {
    return "Ledger app did not accept the Ethereum command. Open the Ethereum app and run Ledger validation again.";
  }
  return error?.message ?? "Unknown Ledger error";
}

async function validateWithLedger(intent) {
  const message = attestationMessage(intent);
  const derivationPath = intent.derivationPath ?? "44'/60'/0'/0/0";

  if (fixtureMode) {
    return {
      action: "validate_publish_setting_intent",
      intent: intent.intent,
      ledgerLayer: "app_action_to_ledger_hardware_gate",
      validationMode: "fixture_ledger_validation",
      validationStatus: "passed",
      hardwareVerified: false,
      expectedDevicePrompt: "Ledger would ask reviewer to confirm publishing the setting",
      attestationMessage: message,
      createdAt: now()
    };
  }

  let TransportNodeHid;
  let Eth;
  try {
    TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
    Eth = require("@ledgerhq/hw-app-eth").default;
  } catch (error) {
    return {
      action: "validate_publish_setting_intent",
      intent: intent.intent,
      ledgerLayer: "app_action_to_ledger_hardware_gate",
      validationMode: "ledger_message_attestation",
      validationStatus: "failed",
      hardwareVerified: false,
      failure: {
        message: `Ledger dependencies are unavailable: ${error.message}`
      },
      createdAt: now()
    };
  }

  let transport;
  try {
    transport = await TransportNodeHid.create();
    const eth = new Eth(transport);
    const address = await eth.getAddress(derivationPath, false);
    const signature = await eth.signPersonalMessage(
      derivationPath,
      Buffer.from(message, "utf8").toString("hex")
    );

    return {
      action: "validate_publish_setting_intent",
      intent: intent.intent,
      ledgerLayer: "app_action_to_ledger_hardware_gate",
      validationMode: "ledger_message_attestation",
      validationStatus: "passed",
      hardwareVerified: true,
      ledgerAddress: address.address,
      derivationPath,
      expectedDevicePrompt: "Ledger signs a dry-run app-gate attestation message",
      attestationMessage: message,
      attestationSignature: {
        v: signature.v,
        r: signature.r,
        s: signature.s
      },
      createdAt: now()
    };
  } catch (error) {
    return {
      action: "validate_publish_setting_intent",
      intent: intent.intent,
      ledgerLayer: "app_action_to_ledger_hardware_gate",
      validationMode: "ledger_message_attestation",
      validationStatus: "failed",
      hardwareVerified: false,
      expectedDevicePrompt: "Ledger signs a dry-run app-gate attestation message",
      failure: {
        statusText: error?.statusText,
        statusCode: error?.statusCode,
        message: ledgerFailureMessage(error)
      },
      createdAt: now()
    };
  } finally {
    if (transport) await transport.close();
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const path = normalize(join(here, requested));
  const root = resolve(here);

  if (!path.startsWith(root)) {
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
}

const server = createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/ledger-validate") {
    try {
      const intent = await readBody(req);
      const receipt = await validateWithLedger(intent);
      json(res, receipt.validationStatus === "passed" ? 200 : 422, receipt);
    } catch (error) {
      json(res, 500, {
        validationStatus: "failed",
        hardwareVerified: false,
        failure: { message: error.message }
      });
    }
    return;
  }

  if (req.method !== "GET") {
    res.writeHead(405);
    res.end("Method not allowed");
    return;
  }

  await serveStatic(req, res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`DMK skills app demo: http://127.0.0.1:${port}/`);
  console.log(fixtureMode ? "Ledger mode: fixture fallback" : "Ledger mode: USB device attestation");
});
