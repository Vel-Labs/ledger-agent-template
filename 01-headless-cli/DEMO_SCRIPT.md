# Demo Script

1. Show `fixtures/send-draft.json` and explain that it is safe fixture data.
2. Run `node src/agent-cli.mjs propose fixtures/send-draft.json`.
3. Open `receipts/latest-proposal.json`.
4. Open the Ethereum app on the USB-connected Ledger.
5. Run `node src/agent-cli.mjs ledger-validate receipts/latest-proposal.json`.
6. Confirm the dry-run attestation signing prompt on the device.
7. Open `receipts/latest-ledger-validation.json`.
8. Point out the proposed action, Ledger validation status, attestation address, and `signing.status = blocked_until_human_approval`.
9. Run `node src/agent-cli.mjs approve receipts/latest-proposal.json --human "demo reviewer"`.
10. Open `receipts/latest-approval.json`.
11. Close by saying the next real step would be physical Ledger transaction confirmation, and this scaffold intentionally stops before transaction signing or broadcast.
