# Agent Demos

Lightweight Ledger agent demo scaffolds for team idea starters.

These demos are a ladder, not separate product pitches:

1. `01-headless-cli` proves an agent can propose crypto operations without hidden signing.
2. `02-dmk-skills-app` proves a developer can add an explicit Ledger hardware gate to an app action.
3. `03-hardware-auth` proves Ledger can gate non-crypto authentication and secret access.
4. `04-comprehensive-workflow` ties the pillars together in a neutral multi-function workflow scaffold.

Every demo runs through a Ledger validation layer by default. The first run may be mocked or dry-run, but the flow itself still validates the intended Ledger gate before approval, secret access, or workflow handoff can continue. See `docs/LEDGER_LAYERING.md`.

Each demo uses the same contract:

- `README.md`: context, setup, and Web2/Web3 implementation ideas.
- `DEMO_SCRIPT.md`: short presenter flow.
- `BOUNDARY.md`: what is real, mocked, gated, and out of scope.
- `BUILDER_PATHS.md`: entry, intermediate, and advanced extension paths.
- `fixtures/`: safe demo inputs, including the default Ledger validation fixture.
- `receipts/`: visible output evidence from a local run.
- `AGENTS.md`: local instructions for agents working inside that demo.

The default posture is dry-run, fixture-backed, and human-approved. Nothing here signs, sends, swaps, decrypts, or authenticates on behalf of a user without an explicit human/device gate.

## Repository Shape

This project is intended to publish as one open-source scaffold repo. The demos share one evidence contract, one builder ladder, one governance model, and one validation command, so keeping them together makes extension and comparison easier.

Split a demo into its own repo only after it has an independent runtime, release path, maintainer, or audience. Until then, the numbered folders should stay together as one inspectable ladder.

## Demo Status

| Demo | Status | Default mode |
|---|---|---|
| `01-headless-cli` | Scaffolded and checkable | Dry-run proposal with Ledger validation path |
| `02-dmk-skills-app` | Scaffolded and checkable | Fixture-backed app gate |
| `03-hardware-auth` | Scaffolded and checkable | WebAuthn/auth scaffold with fixture validation |
| `04-comprehensive-workflow` | Scaffolded, not fully tested end to end | Workflow map plus fixtures |

## Repo Guidance

- `AGENTS.md` defines how agents and humans should work in this repo.
- `docs/LEDGER_LAYERING.md` defines the default Ledger layers used by every demo.
- `docs/BUILDER_LADDER.md` explains the entry/intermediate/advanced model.
- `docs/GOVERNANCE.md` keeps the governance layer lightweight and evidence-oriented.
- `docs/PUBLISHING.md` explains the recommended public repo shape and pre-push checks.
- `contracts/EVIDENCE_CONTRACT.md` defines receipt expectations.
- `docs/AGENT_ASSIGNMENT_TEMPLATE.md` is a copyable brief for targeted agent work.
- `skills/<skill-name>/SKILL.md` files give agents demo-specific operating rules.

## Check

```bash
npm run check
```

The check verifies the scaffold contract and required boundary sections.
