# Boundary

## Proves

- A developer can identify one app action that needs a hardware gate.
- USB Ledger message attestation runs in the default local-server app flow before approval.
- The agent integration point can be explicit and reviewable.
- The Ledger hardware gate is part of the default demo shape, even while simulated.
- App state can wait for a hardware approval result before committing a sensitive change.

## Does Not Prove

- A real DMK install.
- WebAuthn verification by DMK.
- That the agent can bypass app authorization.

## Real

- The browser app models the protected action boundary.
- The local Node server uses Ledger HID transport to request a dry-run device attestation.
- `fixtures/install-plan.json` documents the intended files and integration touchpoints.
- The UI receipt includes the Ledger layer and hardware verification status.

## Mocked Or Dry-Run

- The approval button simulates a device approval result.
- Fixture Ledger validation is available only through `npm run demo:dmk:fixture`.
- No Ledger package is installed.
- No transaction signature or broadcast is produced.

## Requires Physical Ledger Confirmation

- Any real admin approval, transaction signing, key release, policy update, or setting publish event protected by Ledger hardware.

## Dogfood Evidence

- A reviewer can point to the protected action in `src/index.html` and `src/app.js`.
- A reviewer can point to the intended integration plan in `fixtures/install-plan.json`.
- The visible UI receipt records whether validation used real hardware or fixture mode.
