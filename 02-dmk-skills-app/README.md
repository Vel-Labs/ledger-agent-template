# 02 DMK Skills App Scaffold

This demo shows how an app action can be blocked until a Ledger device attests to the action intent and a human approves the change.

The protected action is `publish setting`. The page is small on purpose: one setting, one Ledger validation step, one human approval step, and one publish button.

## Important

Do not open `src/index.html` directly if you want the Ledger device to participate. A browser page cannot talk to the USB Ledger by itself. Run the local Node server below; the page calls that server, and the server prompts the connected Ledger.

## What You Need

- Node.js installed.
- A Ledger device connected over USB.
- The Ethereum app installed and open on the Ledger.
- The Ledger unlocked before clicking `Run Ledger validation`.

The Ledger step signs a dry-run app-gate attestation message. It does not sign or send a transaction.

## Run

From the `Agent-Demos` root:

```bash
npm install
npm run demo:dmk
```

Then open:

```text
http://127.0.0.1:8022/
```

## Demo Flow

1. Confirm `Publish setting` starts disabled.
2. Click `Run Ledger validation`.
3. Confirm the message-signing prompt on the Ledger.
4. Confirm `Simulate Ledger approval` becomes enabled.
5. Click `Simulate Ledger approval`.
6. Confirm `Publish setting` becomes enabled.
7. Click `Publish setting`.
8. Read the receipt.

## No-Device Check

Use fixture mode only for automated or no-device checks:

```bash
npm run demo:dmk:fixture
```

Fixture mode proves the app gate and receipt flow. It is not hardware verification.

## What This Demo Teaches

- A developer can identify one sensitive app action.
- The action can require Ledger validation before approval.
- App state remains blocked until the validation and approval gates pass.
- The receipt says whether the Ledger step used real hardware or fixture mode.

## Integration Story

1. Install the official Ledger Agent Toolkit or Ledger-provided skills when available for the target environment.
2. Let the agent inspect the app boundary and identify the protected action.
3. Wire the official integration at the explicit hardware gate, not around the whole app.
4. Keep app state changes blocked until the gate returns a verified approval result.

`fixtures/install-plan.json` is a placeholder onboarding plan. It uses generic names on purpose so this scaffold is not confused with official Ledger packages.

## Build Ideas

Web2 intents:

- `approveAdminChange`
- `releaseSecret`
- `publishProductionFlag`
- `exportSensitiveData`
- `approvePaymentBatch`

Web3 intents:

- `publishMultisigProposal`
- `approveDaoSetting`
- `releaseTreasuryDraft`
- `confirmAllowlistUpdate`

