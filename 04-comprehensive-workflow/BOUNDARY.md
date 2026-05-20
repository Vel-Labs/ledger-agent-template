# Boundary

## Proves

- A neutral multi-function app can serve as the comprehensive Ledger agent demo.
- The three pillars can fit into one recognizable workflow.
- Ledger validation can be mapped to every sensitive app intent by default.
- The workflow can show identity proof, fresh approval, optional wallet proof, local/off-chain state, and feedback capture together.
- Ledger layering can stay visible without making wallet ownership the primary identity story.
- The simple demos remain the teaching path before the comprehensive app.

## Does Not Prove

- That wallet ownership is the primary user identity.
- That wallet linking alone verifies every signed action.
- That an agent can approve sensitive actions without human/device confirmation.
- Production custody, real asset movement, or emergency-grade security claims.

## Real

- This folder is an implementation-neutral scaffold.
- A real product app can adopt this ladder one intent lane at a time.
- The feature map names the Ledger layers that belong in the comprehensive workflow.

## Mocked Or Dry-Run

- Local/off-chain app state.
- Demo feedback queues.
- Optional wallet proof unless a verified wallet action is explicitly implemented on the live site.

## Requires Physical Ledger Confirmation

- Security Key identity proof.
- Fresh approval for sensitive app actions.
- Wallet transaction signing if real wallet movement is ever enabled.

## Dogfood Evidence

- Receipts show which pillar was exercised.
- Feedback records include what the user expected, what the Ledger/device step showed, and what the app believed happened.
- Wallet-linked actions are not treated as trustworthy unless the signed action is verified against the linked wallet.
