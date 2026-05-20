---
name: ledger-auth-sensitive-access
description: Use when changing or testing the Agent-Demos hardware auth scaffold with Security Key session and Ledger validation before sensitive access.
---

# Ledger Auth Sensitive Access

Use this skill for `03-hardware-auth`.

## Required Boundary

- Opening the page is not an authenticated session.
- The agent cannot create a new authenticated session.
- Secret access stays disabled until session auth and Ledger validation have happened.
- Session evidence and secret-access evidence must stay separate.
- Do not use fixture validation for this demo when hardware is available.
- Receipts must say `webAuthnServerVerified: false` until server verification is actually implemented.

## Intent Ideas

Good sensitive intents include:

- `viewRecoveryNote`
- `exportSensitiveData`
- `approveSupportImpersonation`
- `rotateProductionToken`
- `decryptOpenPgpMessage`

## Test Flow

Serve the folder on localhost, then verify:

1. Sensitive-action buttons start disabled.
2. Security Key sign-in opens a session through a real device prompt.
3. Ledger Security Key validation enables the agent request through a real device prompt.
4. Agent request enables secret approval.
5. Secret approval requires a fresh device prompt and writes a receipt that still names the gate used.
