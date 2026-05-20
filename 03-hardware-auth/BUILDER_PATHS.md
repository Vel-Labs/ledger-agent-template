# Builder Paths

## Entry Level

Serve the folder over localhost and click through session and secret gates:

```bash
python3 -m http.server 8003
```

Learn:

- opening the page is not an authenticated session
- session auth is separate from secret release
- Ledger Security Key validation runs before sensitive access
- Ledger Security Key/FIDO2 is the visible identity layer
- the agent can request access but cannot create the session

## Intermediate

Build richer sensitive-access intents on top of the default Ledger validation:

- `releaseSecret`
- `viewRecoveryNote`
- `approveSupportImpersonation`
- `exportSensitiveData`
- `decryptOpenPgpMessage`
- server challenge generation and local receipt storage

Keep client-side demo evidence clearly labeled until server verification is added.

## Advanced

Turn the scaffold into a production-shaped auth boundary.

Advanced acceptance criteria:

- challenges are server-generated and single-use
- credential IDs are stored server-side
- fresh authentication is required for secret release
- OpenPGP decrypt or secret release requires physical device confirmation
- receipts distinguish session auth from secret access
