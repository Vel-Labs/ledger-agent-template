# AGENTS

This repo contains lightweight Ledger agent demo scaffolds. It should stay clear enough for beginners, but structured enough that intermediate and advanced builders can extend it without hidden assumptions.

## Mission

Show how people can build agent-assisted Ledger workflows where proposals, approvals, authentication, signing boundaries, and evidence stay visible.

## Priority Order

1. Preserve human/device approval boundaries.
2. Keep every demo dry-run or fixture-backed by default.
3. Make claims inspectable through docs, fixtures, receipts, or validation.
4. Keep each demo teachable as a standalone starter.
5. Keep advanced governance optional and layered, not required for the first run.

## Required Reading Before Structural Changes

- `README.md`
- `AGENT_START_HERE.md`
- `docs/LEDGER_LAYERING.md`
- `docs/BUILDER_LADDER.md`
- `docs/GOVERNANCE.md`
- `contracts/EVIDENCE_CONTRACT.md`
- The target demo's `AGENTS.md`, `README.md`, `BOUNDARY.md`, and `BUILDER_PATHS.md`
- The matching repo-local skill under `skills/<skill-name>/SKILL.md`

## Working Rules

- Do not add hidden signing, hidden authentication, hidden wallet linking, or hidden secret release.
- Do include a default Ledger validation layer in every new demo or major demo revision.
- Do not claim Ledger hardware verification unless a real physical device path was used and the evidence says so.
- For `01-headless-cli`, the default validation path must prompt the USB Ledger; `--fixture` is only for CI/no-device checks.
- Do not imply DMK verifies WebAuthn unless the implementation actually proves that path.
- Keep wallet proof optional and additive unless a demo is explicitly wallet-specific.
- Keep beginner paths runnable with local fixtures and no account setup.
- Put advanced integrations behind explicit install, config, and evidence gates.
- Update `BOUNDARY.md` when behavior changes.
- Update the target demo `README.md` and `BUILDER_PATHS.md` when the user-facing flow changes.
- Add or update receipts when a demo has a new evidence path.

## Builder Levels

Each demo should expose three layers:

- Entry level: read the files, run the safe happy path, see Ledger validation, understand the boundary.
- Intermediate: add richer intent functions while preserving Ledger validation receipts.
- Advanced: replace fixture validation with policy, real hardware, real verification, multi-agent handoff, or CI validation without changing the safety default.

## Agent Assignment Contract

Before an agent changes a demo, it should be able to state:

- target demo
- builder level being improved
- files it expects to touch
- safety boundary it must preserve
- evidence it will produce
- validation command it will run

## Demo-Specific Skills

- `01-headless-cli`: `skills/ledger-headless-attestation/SKILL.md`
- `02-dmk-skills-app`: `skills/ledger-app-gate/SKILL.md`
- `03-hardware-auth`: `skills/ledger-auth-sensitive-access/SKILL.md`
- `04-comprehensive-workflow`: `skills/comprehensive-ledger-workflow/SKILL.md`

## Definition Of Done

A scaffold change is done only when:

- the boundary still names what is real and what is mocked
- beginner setup remains short
- intermediate and advanced next steps are discoverable
- relevant receipts or fixtures are present
- `npm run check` passes
