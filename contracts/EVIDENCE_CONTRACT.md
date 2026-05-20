# Evidence Contract

Evidence in this repo should be visible, local, and honest about confidence.

## Receipt Types

### Ledger Validation Receipt

Used by every demo.

Required fields:

- `id` or visible generated receipt body
- `validatedAt` or `createdAt`
- `intent`
- `ledgerLayer`
- `validationMode`
- `validationStatus`
- `hardwareVerified`
- `attestationMessage` when Ledger signs a dry-run message
- `attestationSignature` when Ledger signs a dry-run message
- `expectedDevicePrompt` when a physical device prompt would exist in a real build

### Proposal Receipt

Used by `01-headless-cli`.

Required fields:

- `id`
- `createdAt`
- `action`
- `dryRun`
- `ledgerLayer`
- `preview`
- `approval.required`
- `approval.status`
- `ledgerValidation.required`
- `ledgerValidation.status`
- `signing.performed`

### Approval Receipt

Used by headless, app, hardware auth, and guided journeys.

Required fields:

- `id` or visible generated receipt body
- `approvedAt` or `createdAt`
- `approvedBy` or actor/session equivalent
- `approvedAction` or sensitive action name
- `ledgerLayer`
- `hardwareVerified`
- `signing.performed` when crypto signing is in scope

### Authentication Receipt

Used by `03-hardware-auth`.

Required fields:

- `sessionOpened`
- `agentCreatedSession`
- `webAuthnAttempted`
- `ledgerLayer`
- `sessionMode`
- `createdAt`

### Dogfood Feedback Receipt

Used by `04-guided-journey`.

Required fields:

- `flow`
- `ledgerLayers`
- `expectedDevicePrompt`
- `observedDevicePrompt`
- `appBelievedState`
- `userObservedState`
- `remainingQuestion`

## Required Honesty Labels

Receipts should use these labels where applicable:

- `dryRun: true`
- `hardwareVerified: false`
- `signing.performed: false`
- `validationMode: "fixture_ledger_validation"`
- `sessionMode: "demo_fallback"`
- `secretGate: "simulated_fresh_device_confirmation"`

Do not use production-sounding labels for mocked paths.
