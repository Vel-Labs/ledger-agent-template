# 03 Hardware Auth Scaffold

Purpose: show Ledger beyond crypto through Security Key/FIDO2 sign-in and a clearly separate secret-decrypt lane.

This scaffold keeps three states distinct:

1. Opened app session.
2. New authentication through Security Key/FIDO2.
3. Optional secret decryption after a fresh gate.

The tiny browser app uses real WebAuthn/Security Key prompts for the session, the sensitive-access validation, and the final secret-access approval. It does not create new authenticated sessions for an agent.

## Ledger Layer By Default

This demo always frames the flow as:

1. opened page is not enough
2. Ledger Security Key/FIDO2 creates or opens a human-authenticated session
3. Ledger Security Key validation runs before the agent can request sensitive access
4. sensitive secret access requires a fresh Security Key approval
5. receipt evidence separates session auth from secret access

## Run

Serve this folder over localhost, then open `src/index.html`:

```bash
python3 -m http.server 8003
```

Then visit `http://localhost:8003/src/`.

WebAuthn normally requires a secure context. `localhost` qualifies in modern browsers.

Before starting the flow, unlock the Ledger and open the Security Key app on the device.

This is a full local hardware demo, but verification is still client-side. A production app must generate challenges on the server and verify WebAuthn responses on the server.

For entry, intermediate, and advanced extension ideas, see `BUILDER_PATHS.md`.

## Web2 Idea Starters

- Turn sensitive intents into fresh Ledger-gated checks: "view break-glass credential," "export customer data," "rotate production token," or "approve support impersonation."
- Require fresh authentication before viewing secrets, exporting customer data, or rotating credentials.
- Keep session auth and secret decryption as separate gates with separate receipts.

## Web3 Idea Starters

- Pair passkey/Security Key identity with wallet-specific intents only when needed: "prove wallet ownership," "decrypt local recovery note," or "authorize signing workspace access."
- Require fresh device confirmation before revealing local signing material or recovery instructions.
- Use OpenPGP smart-card flows for non-chain secrets while keeping crypto-wallet flows separate.
