# 01 Headless CLI Scaffold

This demo shows a simple terminal flow where an agent prepares an action, a human verifies it on a Ledger device, and approval is recorded on disk.

It is intentionally small. There is no app server, wallet UI, database, or blockchain broadcast. The goal is to make the human/device checkpoint obvious.

## What You Need

- Node.js installed.
- A Ledger device connected over USB.
- The Ethereum app installed and open on the Ledger.
- The Ledger unlocked before running `ledger-validate`.

The Ledger step signs a dry-run attestation message. It does not sign or send a transaction.

## The Three Steps

```bash
node src/agent-cli.mjs propose fixtures/send-draft.json
node src/agent-cli.mjs ledger-validate receipts/latest-proposal.json
node src/agent-cli.mjs approve receipts/latest-proposal.json --human "demo reviewer"
```

Step 1 writes `receipts/latest-proposal.json`.

Step 2 prompts the USB-connected Ledger. You should see a message-signing prompt on the physical device. If you approve it, the CLI writes `receipts/latest-ledger-validation.json`.

Step 3 writes `receipts/latest-approval.json`, but only if the Ledger validation receipt passed for the same proposal.

## Setup

From the `Agent-Demos` root:

```bash
npm install
```

Then run the demo from this folder:

```bash
cd 01-headless-cli
node src/agent-cli.mjs propose fixtures/send-draft.json
node src/agent-cli.mjs ledger-validate receipts/latest-proposal.json
node src/agent-cli.mjs approve receipts/latest-proposal.json --human "demo reviewer"
```

## What Happens On The Ledger

The CLI asks the Ethereum app to sign a plain message that starts with:

```text
DRY RUN LEDGER ATTESTATION ONLY
No transaction signing or broadcast.
```

This proves a human touched the Ledger for this proposal. It does not authorize a real transfer.

## No-Device Check

Use `--fixture` only when you need an automated check without a physical device:

```bash
node src/agent-cli.mjs ledger-validate receipts/latest-proposal.json --fixture
```

That path is useful for CI, but it is not hardware verification.

## What This Demo Teaches

- An agent can prepare a proposed crypto operation without signing it.
- The proposal is readable before approval.
- Ledger validation is required before approval.
- The human approval receipt is separate from the device attestation receipt.
- Transaction signing remains blocked.

## Common Errors

`LOCKED_DEVICE`: unlock the Ledger, open the Ethereum app, then rerun `ledger-validate`.

`Ledger app did not accept the Ethereum command`: open the Ethereum app and try again.

`Ledger validation receipt missing or not passed`: rerun `ledger-validate` for the current proposal.

## Build Ideas

Beginner ideas:

- Add another fixture, such as `check_balance` or `verify_receive_address`.
- Change the attestation message so the device prompt is easier to understand.

Intermediate ideas:

- Add intent functions like `draft_send`, `draft_swap`, or `prepare_enterprise_operation`.
- Add JSON schema validation for proposal, attestation, and approval receipts.
- Add policy checks for allowed networks, amount limits, and destination labels.

Advanced ideas:

- Add a separate live mode for real transaction signing.
- Keep attestation receipts, approval receipts, and transaction signatures as separate artifacts.
- Add multi-reviewer approval before any live signing step.

