# Agent Start Here

You are working in a Ledger agent workflow scaffold. Start by reading files in this order:

1. `AGENTS.md`
2. `README.md`
3. `docs/LEDGER_LAYERING.md`
4. `contracts/EVIDENCE_CONTRACT.md`
5. The target demo's `AGENTS.md`, `README.md`, `BOUNDARY.md`, and `BUILDER_PATHS.md`
6. The matching `skills/<skill-name>/SKILL.md`

Do not start implementation until you can state:

- target demo
- builder level: entry, intermediate, or advanced
- files you expect to touch
- Ledger or human approval boundary you must preserve
- receipt or validation evidence you will produce
- command you will run before handing back work

## Skill Routing

Use the repo-local skills as operating instructions, not background reading:

| Target | Skill |
|---|---|
| `01-headless-cli` | `skills/ledger-headless-attestation/SKILL.md` |
| `02-dmk-skills-app` | `skills/ledger-app-gate/SKILL.md` |
| `03-hardware-auth` | `skills/ledger-auth-sensitive-access/SKILL.md` |
| `04-guided-journey` | `skills/guided-ledger-journey/SKILL.md` |

When changing a demo, load the matching skill first and preserve its boundary language.

## Non-Negotiables

- Do not add hidden signing.
- Do not let an agent approve its own sensitive action.
- Do not claim physical Ledger verification from fixture receipts.
- Do not treat wallet proof as primary identity unless the demo is explicitly wallet-specific.
- Keep fixture mode available for first-run builders.
