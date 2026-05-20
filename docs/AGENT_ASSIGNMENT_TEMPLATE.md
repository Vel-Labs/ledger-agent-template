# Agent Assignment Template

Use this when asking an agent to improve one demo without losing the repo boundary.

```md
## Assignment

Target demo:
Builder level: entry | intermediate | advanced

## Goal

What should a builder understand or be able to run after this change?

## Allowed Files

- 

## Do Not Touch

- 

## Boundary To Preserve

- No hidden signing.
- No hidden authentication.
- No implied hardware verification without evidence.

## Expected Evidence

- Fixture:
- Receipt:
- Validation command:

## Done When

- README explains the path.
- BOUNDARY names real versus mocked behavior.
- DEMO_SCRIPT still works.
- `npm run check` passes.
```

