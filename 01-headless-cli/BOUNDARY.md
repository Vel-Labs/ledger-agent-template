# Boundary

## Proves

- A terminal agent can create a structured crypto operation proposal.
- Ledger message-signing attestation can be part of the default scaffold path before approval.
- A human approval receipt can be captured before any signing step.
- The Ledger signing layer can be represented as an explicit next gate rather than hidden inside the agent.
- Proposal and approval evidence can stay visible on disk.

## Does Not Prove

- Real transaction signing.
- On-chain broadcast.
- Swap execution.
- Enterprise custody authorization.
- That an agent can approve its own proposal.

## Real

- The CLI parses a fixture and writes proposal/receipt JSON.
- The proposal includes action type, risk notes, dry-run status, and a blocked signing step.
- `ledger-validate` prompts the USB Ledger to sign a dry-run attestation message, then writes a Ledger validation receipt before approval can proceed.
- Receipts include the Ledger layer being exercised.

## Mocked Or Dry-Run

- Balances, addresses, recipients, amounts, fees, and chain data are fixture values.
- Transaction signing is described as the next gated step, not executed.
- `--fixture` validation is available for CI/no-device demos, but it is explicitly labeled and is not the default.

## Requires Physical Ledger Confirmation

- Any real transaction signing, swap approval, receive-address verification, or enterprise operation approval beyond the dry-run attestation message.

## Dogfood Evidence

- `receipts/latest-proposal.json` exists and is human-readable.
- `receipts/latest-ledger-validation.json` exists, has `status = passed`, and records `hardwareVerified = true` for the default USB Ledger path.
- `receipts/latest-approval.json` exists only after the explicit approval command.
- The approval receipt still marks signing as `not_performed`.
