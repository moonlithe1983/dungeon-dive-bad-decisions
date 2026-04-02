# Branch Protection / Ruleset Runbook

Use this runbook to make GitHub require CI before anything lands on `main`.

Repository:

- `moonlithe1983/dungeon-dive-bad-decisions`

Current required workflow check:

- `validate`

Current repository status:

- the canonical repo now has an active `main` ruleset as of April 2, 2026
- use this document to audit or recreate that ruleset if settings drift later

## Recommended GitHub Settings

Open:

- `GitHub -> Settings -> Rules -> Rulesets`
- create or edit the branch ruleset that targets `main`

Apply the rule to:

- branch targeting pattern `main`

Turn on:

- `Require a pull request before merging`
- `Dismiss stale pull request approvals when new commits are pushed`
- `Require status checks to pass before merging`
- `Require branches to be up to date before merging`
- `Require conversation resolution before merging`
- `Block force pushes`
- `Restrict deletions`

Approval guidance:

- for a solo-maintained workflow, `Required approvals` may stay at `0`
- if a second real reviewer/account will be used, raise `Required approvals` to `1`

Required status checks:

- `validate`

## Notes

- The check name is intentionally lowercase and stable so it is easier to select in branch protection.
- The workflow lives at `.github/workflows/validate.yml`.
- The workflow runs `npm run lint`, `npx tsc --noEmit`, and `npm run smoke:sim`.
- If `validate` does not appear in the GitHub branch-protection UI yet, push a branch that triggers the workflow once and refresh the rule editor.
