# Builder Paths

## Entry Level

Run `npm run demo:dmk`, open `http://127.0.0.1:8022/`, and click through the Ledger attestation plus simulated approval gate.

Learn:

- the protected action is narrow
- USB Ledger attestation runs before approval
- app state does not change before approval
- the Ledger hardware approval layer is visible by default
- the demo does not claim real DMK or WebAuthn verification

## Intermediate

Build richer intent functions on top of the default Ledger validation.

Good intermediate additions:

- action intents such as `approveAdminChange`, `releaseSecret`, `publishSetting`, `approvePaymentBatch`, or `submitGovernanceProposal`
- adapter interface such as `requestHardwareApproval(action)`
- validation interface such as `validateLedgerIntent(intent)` backed by the local server or official Ledger tooling
- local receipt persistence
- a test that confirms `publishSetting` cannot run while approval is pending
- a clearer install note for the exact official package once known

## Advanced

Add policy and multi-reviewer governance around the hardware gate.

Advanced acceptance criteria:

- protected actions declare policy before execution
- failed or cancelled hardware approval leaves app state unchanged
- receipts include actor, action, policy, gate result, and timestamp
- docs still say DMK/WebAuthn only where the implementation proves that relationship
