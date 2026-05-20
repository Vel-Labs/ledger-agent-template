# AGENTS

Use this file when working inside `02-dmk-skills-app`.

## Agent Can Do

- Improve the small protected-action app.
- Add app intents such as admin change, secret release, feature publish, payment batch, or governance proposal.
- Keep the app state blocked until Ledger validation and approval have happened.
- Keep the local server path for USB Ledger attestation unless replacing it with an official Ledger toolkit/skill adapter.

## Agent Must Not Do

- Do not imply this scaffold is a real DMK implementation.
- Do not claim DMK verifies WebAuthn unless that path is actually implemented.
- Do not publish the protected setting before the approval gate.
- Do not tell users to open `src/index.html` directly when they expect Ledger hardware validation.

## Local Skill

Read `../skills/ledger-app-gate/SKILL.md` before changing this demo.
