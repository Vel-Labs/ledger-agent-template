#!/usr/bin/env node
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const appName = process.argv.slice(2).join(" ") || "Ethereum";

function ledgerFailureMessage(error) {
  if (error?.statusText === "LOCKED_DEVICE" || error?.statusCode === 0x5515) {
    return "Ledger is locked. Unlock the device, then rerun this command.";
  }
  return error?.message ?? "Unknown Ledger error";
}

let TransportNodeHid;
try {
  TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
} catch (error) {
  console.error(`Ledger transport dependency is unavailable: ${error.message}`);
  process.exit(1);
}

let transport;
try {
  transport = await TransportNodeHid.create();
  await transport.send(0xe0, 0xd8, 0x00, 0x00, Buffer.from(appName, "ascii"));
  console.log(`Requested Ledger app: ${appName}`);
  process.exitCode = 0;
} catch (error) {
  console.error(ledgerFailureMessage(error));
  process.exitCode = 1;
} finally {
  if (transport) await transport.close();
}
