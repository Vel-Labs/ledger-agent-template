# Governance

This repo borrows the useful parts of the larger local project scaffolds without requiring their full machinery.

## Truth

Each demo must name:

- which Ledger layer it demonstrates by default
- what it proves
- what it does not prove
- what is real
- what is mocked or dry-run
- what requires physical Ledger confirmation
- what evidence counts as dogfooded

The target file is each demo's `BOUNDARY.md`.

## Hardening

Each demo should have at least one deterministic check:

- a command that runs
- a JS syntax check
- a fixture parse
- a schema check
- a receipt existence check

The root `npm run check` command validates the current scaffold contract.

## Clarity

Each demo should have a presenter flow in `DEMO_SCRIPT.md` and builder levels in `BUILDER_PATHS.md`.

Beginner-facing docs should stay short. Advanced detail belongs in builder paths, contracts, or optional docs.

## Change Discipline

Use the smallest file that captures the change:

- Behavior change: update source and `BOUNDARY.md`.
- Presenter flow change: update `DEMO_SCRIPT.md`.
- Audience path change: update `BUILDER_PATHS.md`.
- Evidence change: update `contracts/EVIDENCE_CONTRACT.md` or receipts.
- Cross-demo policy change: update `AGENTS.md` or this file.

## Hidden Trust Checks

Before calling a demo improved, ask:

1. What does a new builder no longer have to guess?
2. What claim is now backed by a file, command, or receipt?
3. What still depends on private context, real hardware, or external accounts?
4. Does the beginner path still work without setup friction?
5. Did any copy imply real signing, auth, or decryption when the path is mocked?
