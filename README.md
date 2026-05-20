# Ledger Agent Template

Open scaffolds for building agent-assisted Ledger workflows where proposals, approvals, hardware gates, and receipts stay visible.

The goal is simple: help builders start with safe local fixtures, then replace one lane at a time with real Ledger, WebAuthn, wallet, policy, app, or review infrastructure.

Nothing in this template signs, sends, swaps, decrypts, authenticates, or releases secrets on behalf of a user without an explicit human or device gate.

## One-Line Start

```bash
npx ledger-agent-template my-ledger-agent-workflows
cd my-ledger-agent-workflows
npm install
npm run check
npm run demo:comprehensive
```

For agent-assisted implementation, give the agent this first:

```text
Read AGENT_START_HERE.md, then use the matching repo-local skill before changing any demo.
```

## What You Get

| Folder | What it teaches | First safe run |
|---|---|---|
| `01-headless-cli` | Agent proposes an operation, human reviews it, signing stays blocked | `npm run check:headless` |
| `02-dmk-skills-app` | App action waits for Ledger-shaped validation before publish | `npm run demo:dmk:fixture` |
| `03-hardware-auth` | Security Key/WebAuthn session plus fresh sensitive-access gate | Open the local browser scaffold |
| `04-comprehensive-workflow` | All lanes composed into one neutral workflow receipt | `npm run demo:comprehensive` |

The comprehensive workflow is a fixture-level tandem run. It proves the scaffold contracts compose; it does not prove physical Ledger verification, server-verified WebAuthn, production custody, signing, broadcast, wallet movement, or secret release.

## Human Index

| Need | Start here |
|---|---|
| Understand the project | `README.md` |
| Install the template | `npx ledger-agent-template <target-dir>` |
| Pick the right demo | `docs/BUILDER_LADDER.md` |
| Understand safety boundaries | `docs/LEDGER_LAYERING.md` |
| See what evidence should look like | `contracts/EVIDENCE_CONTRACT.md` |
| Publish or fork the repo | `docs/PUBLISHING.md` |
| Extend a specific demo | That demo's `README.md`, `BOUNDARY.md`, and `BUILDER_PATHS.md` |

## Agent Index

| Agent task | Required context |
|---|---|
| Orient in the repo | `AGENT_START_HERE.md`, then `AGENTS.md` |
| Change `01-headless-cli` | `01-headless-cli/AGENTS.md` and `skills/ledger-headless-attestation/SKILL.md` |
| Change `02-dmk-skills-app` | `02-dmk-skills-app/AGENTS.md` and `skills/ledger-app-gate/SKILL.md` |
| Change `03-hardware-auth` | `03-hardware-auth/AGENTS.md` and `skills/ledger-auth-sensitive-access/SKILL.md` |
| Change `04-comprehensive-workflow` | `04-comprehensive-workflow/AGENTS.md` and `skills/comprehensive-ledger-workflow/SKILL.md` |
| Add evidence | `contracts/EVIDENCE_CONTRACT.md` |
| Change repo structure | `AGENTS.md`, `docs/BUILDER_LADDER.md`, and `docs/PUBLISHING.md` |

## Agent Skill Guidance

Agents should treat files under `skills/` as operating instructions, not optional documentation.

Before editing a demo, an agent should:

1. Read `AGENT_START_HERE.md`.
2. Read the target demo's `AGENTS.md`.
3. Read the matching `skills/<skill-name>/SKILL.md`.
4. State the target demo, builder level, files to touch, approval boundary, and expected evidence.
5. Implement only inside that stated scope.
6. Run the relevant validation command before handing work back.

This keeps agents from flattening the scaffold, skipping the Ledger layer, or overstating fixture evidence as real hardware proof.

## Repository Shape

This is intentionally one repo. The demos share one evidence contract, one builder ladder, one validation command, and one set of agent skills.

Split a demo into its own repo only after it has an independent runtime, release path, maintainer, or audience. Until then, the numbered folders should stay together as one inspectable ladder.

## Commands

```bash
npm run check
npm run check:headless
npm run demo:comprehensive
npm run demo:comprehensive:auto
npm run demo:dmk:fixture
```

`npm run check` verifies the scaffold contract. `npm run check:headless` exercises the headless receipt path. `npm run demo:comprehensive` guides a reviewer through every lane before writing a combined receipt under `04-comprehensive-workflow/receipts/`. `npm run demo:comprehensive:auto` is only for CI or smoke checks where a guided reviewer is not present.

## Ledger Packages

This template installs the Ledger hardware packages needed by the USB attestation lanes. Fixture mode remains the default safe path, but the real Ledger path should be available without making builders discover packages by hand.

To run real Ledger attestation, use a connected, unlocked Ledger with the Ethereum app open, then run the non-fixture validation path from the relevant demo.

## Boundaries

- Fixture validation is not physical Ledger verification.
- WebAuthn client evidence is not server verification.
- Wallet proof is optional and action-specific, not primary identity by default.
- Agents cannot approve their own sensitive actions.
- No demo should hide signing, broadcast, secret release, or privileged access behind agent automation.
