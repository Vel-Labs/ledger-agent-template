# Builder Paths

## Entry Level

Run the fixture-backed proposal flow:

```bash
node src/agent-cli.mjs propose fixtures/send-draft.json
node src/agent-cli.mjs ledger-validate receipts/latest-proposal.json
node src/agent-cli.mjs approve receipts/latest-proposal.json --human "demo reviewer"
```

Learn:

- proposals are separate from approvals
- Ledger message-signing attestation is required before approval
- signing is blocked
- Ledger device confirmation is visible as the next gate
- receipts are local evidence

## Intermediate

Build richer intent handling on top of the default Ledger validation:

- add intents such as `check_balance`, `verify_receive_address`, `draft_send`, `draft_swap`, or `prepare_enterprise_operation`
- add JSON schema validation for proposal, Ledger attestation, and approval receipts
- add policy checks for maximum amount, allowed network, destination labels, or reviewer role
- add a sandbox chain fee preview that still cannot sign
- add an intent-to-expected-device-prompt mapper

Keep `dryRun: true` as the default.

## Advanced

Replace the dry-run attestation with richer Ledger-backed intent checks while keeping transaction signing separate.

Advanced acceptance criteria:

- dry-run remains default
- real transaction signing requires a separate physical Ledger confirmation
- signed output is never confused with the proposal receipt
- policy failure produces a receipt explaining why signing was blocked
- intent functions produce reviewer-friendly prompts before any device step
