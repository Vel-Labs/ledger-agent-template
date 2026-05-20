# AGENTS

Use this file when working inside `03-hardware-auth`.

## Agent Can Do

- Improve the Security Key/FIDO2 and sensitive-access scaffold.
- Add sensitive intents such as view recovery note, export sensitive data, approve support impersonation, rotate token, or OpenPGP decrypt.
- Keep session authentication separate from secret access.
- Add server-side WebAuthn verification when the demo grows beyond static HTML.

## Agent Must Not Do

- Do not claim an agent can create a new authenticated session.
- Do not release the secret before Ledger validation.
- Do not treat wallet ownership as the same thing as WebAuthn identity.
- Do not reintroduce fixture validation for this demo when hardware is available.

## Local Skill

Read `../skills/ledger-auth-sensitive-access/SKILL.md` before changing this demo.
