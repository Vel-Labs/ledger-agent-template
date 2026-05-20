# 04 Guided Journey Demo

Purpose: define a neutral multi-function demo that brings the Ledger agent story together across identity, sensitive action approval, optional wallet proof, local/off-chain state, and dogfood feedback.

This folder is a scaffold, not a finished product app. It explains the contract: which Ledger-gated intents a guided journey app should show, what evidence should be captured, and what must stay optional or local-only.

For entry, intermediate, and advanced extension ideas, see `BUILDER_PATHS.md`.

## Run The Guided Journey

```bash
npm run demo:journey
```

The guided journey runs each demo lane and writes one combined receipt to `receipts/latest-guided-journey.json` plus per-lane receipts under `receipts/`.

It runs the headless CLI, starts the app-gate server, opens browser surfaces, prompts before real Ledger submission points, requests the Ethereum or Security Key app when possible, captures reviewer observations, and records what was actually tested. Ledger lanes default to real USB attestation; type `demo` at a Ledger prompt to use fixture mode.

Before the Security Key lane, exit the Ethereum app back to the Ledger dashboard. The harness will request the Security Key app from there and falls back to a manual prompt if the device rejects the request.

Use the automated smoke path only for CI:

```bash
npm run demo:journey:auto
```

Fixture runs prove the demos can be composed into one visible guided journey, but they do not prove physical Ledger verification, server-verified WebAuthn, production custody, signing, broadcast, or secret release.

## Ledger Layer By Default

The guided journey should show Ledger layers together:

1. Security Key/WebAuthn identity proof
2. Ledger validation for each sensitive app intent
3. fresh Ledger approval for sensitive actions
4. optional wallet proof only when wallet-specific actions need it
5. local/off-chain state by default
6. dogfood feedback that captures device prompt, app state, and unresolved questions

## Journey Story

The guided journey combines the simpler pillars into one app-shaped flow:

- Security Key identity proof opens the session.
- Ledger validation maps each sensitive intent to the right gate.
- Fresh approval gates sensitive actions.
- Optional wallet proof supports Web3-flavored actions without becoming the primary identity path.
- Optional local/off-chain state keeps demo risk low.
- Dogfood feedback captures where Ledger/agent UX needs improvement.

## Live Demo Intents

- `proveSessionIdentity`: human signs in with Security Key/WebAuthn.
- `approveSensitiveAction`: a consequential app action requires fresh Ledger approval.
- `releasePrizeCode`: an agent suggests a reward action and the human gates it.
- `signOptionalWalletMove`: wallet proof is used only for wallet-specific actions.
- `captureDogfoodFeedback`: the site records device prompt, app state, user expectation, and remaining question.

## Relationship To The Pillars

- `01-headless-cli`: proposals and approval receipts.
- `02-dmk-skills-app`: protected app actions with explicit hardware gates.
- `03-hardware-auth`: Security Key identity plus fresh secret/sensitive-action approval.

## Web2 Idea Starters

- Team permissions workflow where intents like `promoteMember`, `freezeTeamSetting`, or `releasePrizeCode` require fresh hardware confirmation.
- Internal support workflow where agents suggest `refundOrder`, `unlockAccount`, or `escalateCase` and humans confirm.
- Compliance training scenario where every sensitive action has a Ledger validation receipt.

## Web3 Idea Starters

- Optional wallet proof for intents like `signRivalryMove`, `claimBadge`, `joinTreasuryVote`, or `proveCollectibleOwnership`.
- Local/off-chain economy before any real asset movement.
- Treasury or community governance metaphors where Ledger confirmation gates consequential actions.

## Implementation Note

Keep wallet linking optional and additive. The first identity story should remain human-verified Security Key/WebAuthn, with wallet proof introduced only for wallet-specific actions.

The guided journey should teach how the pillars fit together. The smaller demos remain the place where people learn the individual pillars.
