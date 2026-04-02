# Dungeon Dive: Bad Decisions
## GitHub Readiness, Onboarding, and Device-Sweep Addendum

Version date: April 2, 2026
Last refreshed: April 2, 2026 after the GitHub-readiness pass, opening-flow cleanup, starter-roster update, root-doc refresh, and current Android visual sweep.

Purpose: Use this addendum as the freshest source of truth for the repo's GitHub readiness, the revised opening flow, and what still needs to happen before broader external testing or store upload. Keep `PROJECT_HANDOFF_2026-03-24.md` as the broad product/system handoff and `PROJECT_HANDOFF_2026-03-31.md` as the prior polish/readiness addendum.

## 1. What changed on April 2, 2026

- Fresh-profile onboarding was cleaned up so the app no longer asks the player to "choose" IT Support when it is the only unlocked class.
- The fresh-run path now goes:
  - title
  - companion select
  - run map
  - battle / reward / event flow
- The `class-select` route still exists, but it now behaves as an assigned-role briefing when only one class is unlocked and remains the real selection surface once more classes are available.
- The default starting companion roster is now three companions instead of two:
  - Facilities Goblin
  - Former Executive Assistant
  - Security Skeleton
- Existing saved profiles are normalized on load so older saves also get brought up to that minimum starting roster.
- The remaining obvious formatting artifact on the live settings route was fixed (`ADA Contrast` no longer renders with stray backticks).
- Root repo docs were refreshed so they no longer claim the old opening flow or say GitHub branch protection is still pending.
- `.github/BRANCH_PROTECTION.md` now matches GitHub's current ruleset UI instead of the older "branch protection rule" language.

## 2. What is now accurate about the app and repo

- The opening player experience now feels more intentional:
  - one assigned default class instead of a fake class-choice step
  - three default companions so the first team pick actually feels strategic
- Companion identity is stronger at the start because the third slot widens the first meaningful roster decision immediately.
- The repo's public docs now better match the app the player/tester will actually see:
  - `README.md`
  - `SUPPORT.md`
  - `PRIVACY_POLICY.md`
  - `.github/BRANCH_PROTECTION.md`
- GitHub readiness is stronger than it was on March 31:
  - the `validate` workflow remains the required CI surface
  - the `main` ruleset is now enabled in the canonical repository
  - the repo docs no longer tell the reader that branch protection still needs to be turned on

## 3. Validation refreshed on April 2, 2026

Fresh automated checks performed during this pass:

- `npx tsc --noEmit`: passed
- `npm run lint`: passed
- `npm run smoke:sim`: passed

Fresh Android visual sweep performed on the current debug build:

- title screen: checked
- companion select: checked
- assigned-role / `class-select` fallback: checked
- settings: checked
- support: checked
- privacy: checked
- no-active-run `run-map` state: checked

Important note:

- This was a visual/readability/context pass, not a full gameplay regression.
- The current source still needs a deeper Android route check through:
  - battle
  - reward
  - event
  - end-run
  - resume
  - native `dev-smoke`

## 4. What is still open after this pass

This pass did not finish the remaining release-facing or owner-only items:

- a focused Android gameplay regression on the current code/docs state
- a fresh final signed build from a trustworthy environment if the Windows long-path rebuild issue still blocks final artifact generation here
- final public support inbox confirmation
- hosted public support and privacy URLs for store submission
- store screenshots, icon/art, short description, long description, ratings answers, and data-safety answers
- a small outside playtest on the current polished build
- internal or closed Google Play testing after that outside playtest prep is done

## 5. Best next move after this pass

The next highest-value step is no longer repo plumbing. It is product validation on the current source:

1. Run the focused Android gameplay regression on battle, reward, event, end-run, resume, and `dev-smoke`.
2. Fix only real blocker issues found there.
3. Produce a fresh signed build from the final accepted source in a trustworthy environment.
4. Finalize support identity and hosted support/privacy URLs.
5. Prepare the Google Play listing assets and copy.
6. Run a small outside playtest.
7. Move into Google Play internal or closed testing.

## 6. Source of truth after this pass

Use these docs together:

- `PROJECT_HANDOFF_2026-04-02.md`
- `PROJECT_HANDOFF_2026-03-31.md`
- `PROJECT_HANDOFF_2026-03-30.md`
- `PROJECT_HANDOFF_2026-03-27.md`
- `PROJECT_HANDOFF_2026-03-24.md`
- `DUNGEON_DIVE_APP_NEEDS_2026-04-02.md`
- `README.md`
- `SUPPORT.md`
- `PRIVACY_POLICY.md`
- `.github/BRANCH_PROTECTION.md`

Simple rule:

- use March 24 for the broad product/system handoff
- use March 31 for the previous polish/readiness snapshot
- use this April 2 addendum for the current onboarding, GitHub-readiness, and repo-doc state
