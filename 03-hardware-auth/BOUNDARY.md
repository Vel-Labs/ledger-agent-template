# Boundary

## Proves

- Hardware-backed authentication can protect non-crypto app access.
- Ledger Security Key validation runs before the sensitive access request is enabled.
- Ledger Security Key/FIDO2 can be shown as a first-class layer, not a generic login detail.
- A sensitive secret lane can require a fresh gate after the session is open.
- The app can record that an agent attempted a sensitive action and was blocked by the device gate.

## Does Not Prove

- Production WebAuthn server verification.
- OpenPGP hardware decrypt.
- That an agent can independently create a new authenticated session.
- That WebAuthn identity and wallet ownership are the same thing.

## Real

- The browser calls `navigator.credentials.create` and `navigator.credentials.get` for the session, validation gate, and approval gate.
- The UI separates session status from secret access status.
- Receipts include the active Ledger layer and whether WebAuthn was attempted.

## Mocked Or Dry-Run

- Challenge generation is client-side demo behavior.
- Server-side verification is absent.
- Secret decryption is simulated unless a real OpenPGP lane is added.

## Requires Physical Ledger Confirmation

- Real Security Key registration/sign-in.
- Real Security Key validation before sensitive access.
- Real fresh Security Key approval before secret release.
- Real OpenPGP smart-card decrypt.
- Any production release of a sensitive secret.

## Dogfood Evidence

- A demo run shows an opened session separately from a fresh secret gate.
- The receipt explicitly says WebAuthn was attempted and that server-side verification was not performed.
- No receipt claims the agent created a new authenticated session.
