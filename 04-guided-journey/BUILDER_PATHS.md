# Builder Paths

## Entry Level

Use this folder as the guided journey after running the three pillar demos.

Learn:

- the guided journey is not the first teaching surface
- Security Key identity comes first
- Ledger validation maps each sensitive app intent to a gate
- fresh approval gates sensitive actions
- Ledger layers remain explicit across identity, approval, wallet proof, and feedback
- wallet proof is optional and action-specific

## Intermediate

Wire one intent lane into a real app surface at a time.

Good intermediate slices:

- `proveSessionIdentity`: map Security Key sign-in to the existing identity flow
- `approveSensitiveAction`: add a fresh approval receipt to one sensitive app action
- `signOptionalWalletMove`: verify the signature against the linked wallet before trusting it
- `captureDogfoodFeedback`: add feedback capture for one approval moment
- keep local/off-chain app state separate from wallet proof

## Advanced

Use a real app surface for full dogfooding.

Advanced acceptance criteria:

- every sensitive action has a receipt
- wallet-linked actions verify the signature against the linked wallet
- failures are shown as first-class evidence, not hidden in logs
- feedback captures device prompt, app state, user expectation, and unresolved questions
- local/off-chain app state remains safe unless real asset movement is intentionally enabled
