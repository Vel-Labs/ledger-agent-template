# Publishing

## Recommended Shape

Publish this folder as one public scaffold repository.

The demos are intentionally a ladder:

- `01-headless-cli`: proposal and approval receipts
- `02-dmk-skills-app`: app action gate
- `03-hardware-auth`: authentication and sensitive access gate
- `04-comprehensive-workflow`: neutral multi-function workflow map

Keeping them together gives builders one shared evidence contract, one safety boundary model, one validation command, and one path from beginner to advanced work.

## When To Split Repos

Split a demo into a separate repo only when it has at least one of these:

- independent runtime or deployment path
- separate release cadence
- separate maintainer or audience
- enough real implementation that the scaffold contract is no longer the main artifact

Until then, separate repos would add discovery and maintenance overhead without making the scaffolds easier to extend.

## Public Positioning

Use this framing:

> Open-source Ledger agent workflow scaffolds for builders. Each demo keeps agent proposals, human approval, hardware gates, and evidence receipts visible by default.

Suggested npm package name:

```text
ledger-agent-template
```

Suggested one-line start:

```bash
npx ledger-agent-template my-ledger-agent-workflows
```

Avoid claiming:

- production custody readiness
- hidden or autonomous signing
- physical hardware verification for fixture-backed paths
- wallet ownership as primary identity
- demo 4 as end-to-end tested until that has receipts

The template intentionally installs the Ledger USB packages because hardware attestation is a first-class lane. Fixture paths still remain the default safe path, and physical Ledger proof must be claimed only when a real device receipt exists.

## Pre-Push Checks

Run:

```bash
npm run check
npm run check:headless
npm run demo:comprehensive:auto
```

`npm run check` verifies the scaffold contract. `npm run check:headless` exercises the headless CLI receipt path.
`npm run demo:comprehensive:auto` runs the non-interactive smoke path for CI. For public demo prep, run `npm run demo:comprehensive`; it invokes each lane, opens browser surfaces, requests the relevant Ledger app when possible, assumes real Ledger validation unless the reviewer types `demo`, and captures reviewer observations in the combined receipt.

Demo 4 is currently a scaffolded workflow map. Do not describe it as fully tested until a real app surface has generated receipts for its identity, approval, optional wallet proof, and feedback lanes.
