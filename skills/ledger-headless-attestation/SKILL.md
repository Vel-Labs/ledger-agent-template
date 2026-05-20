---
name: ledger-headless-attestation
description: Use when changing or running the Agent-Demos headless CLI scaffold that requires USB Ledger message attestation before approval.
---

# Ledger Headless Attestation

Use this skill for `01-headless-cli`.

## Required Boundary

- Default `ledger-validate` must use a USB-connected Ledger and require a manual device prompt.
- `--fixture` is allowed only for CI/no-device checks and must never be described as hardware verification.
- The attestation signs a dry-run message, not a transaction.
- Approval must fail if the proposal has no matching passed Ledger validation receipt.

## Beginner Flow

```bash
cd /Users/steven/Workspace/40_Code/client-work/Agent-Demos
npm install
cd 01-headless-cli
node src/agent-cli.mjs propose fixtures/send-draft.json
node src/agent-cli.mjs ledger-validate receipts/latest-proposal.json
node src/agent-cli.mjs approve receipts/latest-proposal.json --human "demo reviewer"
```

Expected device state: Ledger unlocked, Ethereum app open, message-signing prompt manually confirmed.

## Safe Check

Use this for automated checks:

```bash
npm run check:headless
```

This uses `--fixture`; it validates the scaffold path, not the hardware path.

