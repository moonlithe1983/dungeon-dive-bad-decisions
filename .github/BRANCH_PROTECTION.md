# Branch Protection Runbook

Use this runbook to make GitHub require CI before anything lands on `main`.

Repository:

- `moonlithe1983/dungeon-dive-bad-decisions`

Current required workflow check:

- `validate`

## Recommended GitHub Settings

Open:

- `GitHub -> Settings -> Branches -> Add branch protection rule`

Apply the rule to:

- `main`

Turn on:

- `Require a pull request before merging`
- `Require approvals`
- `Dismiss stale pull request approvals when new commits are pushed`
- `Require status checks to pass before merging`
- `Require branches to be up to date before merging`
- `Require conversation resolution before merging`

Required status checks:

- `validate`

Recommended merge restrictions:

- disable direct pushes to `main`
- allow force pushes: off
- allow deletions: off

## Notes

- The check name is intentionally lowercase and stable so it is easier to select in branch protection.
- The workflow lives at `.github/workflows/validate.yml`.
- The workflow runs `npm run lint`, `npx tsc --noEmit`, and `npm run smoke:sim`.
- If `validate` does not appear in the GitHub branch-protection UI yet, push a branch that triggers the workflow once and refresh the rule editor.
