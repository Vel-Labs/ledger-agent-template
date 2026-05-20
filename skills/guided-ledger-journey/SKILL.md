---
name: guided-ledger-journey
description: Use when changing the guided journey scaffold that ties all Ledger agent pillars together.
---

# Guided Ledger Journey

Use this skill for `04-guided-journey`.

## Required Boundary

- This folder is a neutral multi-function workflow planning lane, not a product-specific app implementation.
- Security Key/WebAuthn identity stays first.
- Fresh Ledger approval gates sensitive actions.
- Wallet proof is optional and only for wallet-specific actions.
- Local/off-chain state remains the safe default.
- Dogfood feedback records the device prompt, app state, user expectation, and remaining question.

## Intent Lanes

Useful guided-journey lanes:

- `proveSessionIdentity`
- `approveSensitiveAction`
- `releasePrizeCode`
- `signOptionalWalletMove`
- `captureDogfoodFeedback`

When mapping a lane, name the Ledger gate, receipt, fallback mode, and what would count as real dogfood evidence.
