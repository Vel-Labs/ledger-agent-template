# Builder Ladder

The demos should support three audiences without becoming three separate repos.

## Entry Level

Goal: understand the concept and run a safe happy path.

Entry-level builders should see:

- one short setup command or file-open step
- fixture data instead of live credentials
- the default Ledger validation layer for the demo, even if it is fixture-backed
- a visible receipt or terminal preview
- a clear boundary that says what is mocked
- no required wallet, Ledger device, cloud account, or paid service

They should not have to understand custody, FIDO server verification, WebAuthn attestation, DMK internals, policy engines, or multi-agent governance to complete the first run.

## Intermediate

Goal: replace one mocked piece with a local or sandboxed real component.

Intermediate builders can add:

- intent functions behind the same Ledger validation interface
- schema validation for proposals and receipts
- persistence for receipts
- a sandbox Ledger, WebAuthn, or wallet-proof path
- one concrete validation layer upgraded from fixture to sandbox
- basic policy checks, such as spending limits or action allowlists
- tests for the boundary that must not be bypassed

The key rule is one intent lane at a time. Do not replace fixtures, approval gates, storage, and signing all in the same step.

## Advanced

Goal: make the demo credible for dogfooding or internal review.

Advanced builders can add:

- real physical Ledger confirmation
- server-side WebAuthn verification
- OpenPGP smart-card decrypt
- verified wallet/signature ownership for wallet-specific actions
- policy engines and multi-reviewer approvals
- CI checks that verify docs, contracts, fixtures, and receipts
- multi-agent workstreams with explicit ownership
- threat modeling and failure-mode receipts

Advanced work must preserve the beginner path. The safe fixture mode remains the default unless a user intentionally enables real hardware or live integrations.

## Track Mapping

| Demo | Entry Level | Intermediate | Advanced |
|---|---|---|---|
| `01-headless-cli` | Run proposal, Ledger validation, and approval receipts from a fixture. | Add intent functions like balance check, receive address, send draft, swap draft, or enterprise operation. | Add real Ledger confirmation, policy, and signed-output separation. |
| `02-dmk-skills-app` | Click through Ledger validation, simulated approval, and protected publish. | Add app intents like admin change, secret release, feature publish, or payment batch. | Add official toolkit adapter, policy, receipts, tests, and real device-backed approval. |
| `03-hardware-auth` | Open session, run Ledger validation, then request and approve secret access. | Add sensitive intents like recovery note, support impersonation, customer export, or OpenPGP decrypt. | Add production-grade WebAuthn verification and secret-release audit trails. |
| `04-guided-journey` | Use the guided journey after learning the Ledger validation layers. | Wire one intent lane into a real app surface. | Combine identity, approval, optional wallet proof, local/off-chain state, and feedback evidence. |
