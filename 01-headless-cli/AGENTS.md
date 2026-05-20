# AGENTS

Use this file when working inside `01-headless-cli`.

## Agent Can Do

- Help a beginner run the three-command flow.
- Explain the difference between proposal, Ledger attestation, human approval, and transaction signing.
- Add new dry-run intents such as balance check, receive-address verification, send draft, swap draft, or enterprise operation draft.
- Preserve the real USB Ledger attestation as the default `ledger-validate` path.
- Use `--fixture` only for CI or no-device checks, and label that evidence clearly.

## Agent Must Not Do

- Do not bypass `ledger-validate` before approval.
- Do not treat `--fixture` as proof of hardware verification.
- Do not add transaction signing or broadcast to the beginner path.
- Do not hide Ledger prompts behind automatic approval.

## Local Skill

Read `../skills/ledger-headless-attestation/SKILL.md` before changing this demo.

