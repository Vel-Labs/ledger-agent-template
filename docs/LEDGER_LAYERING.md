# Ledger Layering

Every demo in this repo should include Ledger validation by default, even when the first run is mocked or fixture-backed.

The point is not that every demo performs every Ledger operation. The point is that every happy path passes through a Ledger-shaped validation step before approval, secret access, or handoff continues.

## Default Layers

1. **Session or actor context**
   - Who is using the app or CLI?
   - Is this only an opened local session, or a fresh authenticated session?

2. **Agent proposal**
   - What did the agent prepare?
   - Is the proposal visible before any sensitive operation?

3. **Human review**
   - What does the human inspect?
   - What explicit action records approval or rejection?

4. **Ledger device gate**
   - What Ledger validation runs in the default demo?
   - What would require physical Ledger confirmation in a real build?
   - Is the current demo real hardware, simulated hardware, fixture validation, or dry-run only?

5. **Optional wallet or signing lane**
   - Is wallet proof actually needed for this action?
   - If yes, how is signature ownership verified?
   - If no, the demo should not imply wallet ownership is primary identity.

6. **Receipt evidence**
   - What file, terminal output, UI receipt, or feedback record proves what happened?
   - Does the evidence honestly label mocked, dry-run, or unverified paths?

## Layer Mapping By Demo

| Demo | Ledger layer shown by default | First-run mode | Advanced replacement |
|---|---|---|---|
| `01-headless-cli` | Proposal -> USB Ledger message attestation -> human approval -> transaction signing gate | Real Ledger attestation and dry-run proposal by default; fixture fallback only with `--fixture` | Intent policy plus real Ledger transaction confirmation behind an explicit live mode |
| `02-dmk-skills-app` | App action -> Ledger validation -> simulated approval -> receipt | Fixture validation before approval | Official Ledger toolkit/skill adapter plus action policy |
| `03-hardware-auth` | Security Key/FIDO2 session -> Ledger validation -> fresh sensitive-action gate | WebAuthn attempt plus fixture validation | Server-verified WebAuthn and optional OpenPGP smart-card decrypt |
| `04-comprehensive-workflow` | Identity -> approval -> optional wallet proof -> feedback, each mapped to Ledger validation | Workflow validation map | Real workflow receipts across all Ledger-gated intents |

## Non-Claims

- A mocked gate is not hardware verification.
- Fixture Ledger validation is still a required scaffold step; it is not a claim of physical device verification.
- A WebAuthn session is not wallet ownership.
- Wallet linking is not proof that every signed action verifies correctly.
- An agent cannot independently create a new authenticated session.
- An agent cannot approve its own sensitive action.
