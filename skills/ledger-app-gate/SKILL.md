---
name: ledger-app-gate
description: Use when changing or testing the Agent-Demos protected app action scaffold with Ledger validation before approval.
---

# Ledger App Gate

Use this skill for `02-dmk-skills-app`.

## Required Boundary

- Protected actions stay disabled until Ledger validation runs.
- Approval stays disabled until validation succeeds.
- Publishing stays disabled until approval succeeds.
- The default path should run through `npm run demo:dmk` and USB Ledger attestation.
- Fixture validation must say `hardwareVerified: false` and should be limited to `npm run demo:dmk:fixture`.
- Do not call the scaffold a real DMK implementation.

## Intent Ideas

Good app intents include:

- `approveAdminChange`
- `releaseSecret`
- `publishSetting`
- `approvePaymentBatch`
- `submitGovernanceProposal`

Each intent should produce a visible receipt with validation mode, validation status, approval mode, and hardware verification status.

## Test Flow

Run `npm run demo:dmk`, open `http://127.0.0.1:8022/`, then verify:

1. `Publish setting` starts disabled.
2. `Simulate Ledger approval` starts disabled.
3. `Run Ledger validation` enables approval and writes a validation receipt.
4. `Simulate Ledger approval` enables publishing.
5. `Publish setting` writes an approval receipt.
