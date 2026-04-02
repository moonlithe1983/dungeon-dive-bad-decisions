# Dungeon Dive: Bad Decisions
## GitHub Readiness, Route-Choice, and Device-Sweep Addendum

Version date: April 2, 2026
Last refreshed: April 2, 2026 after the GitHub-readiness pass, opening-flow cleanup, route-choice UX pass, defeat-recap upgrade, root-doc refresh, and current Android validation refresh.

Purpose: Use this addendum as the freshest source of truth for the repo's GitHub readiness, the revised opening flow, the new route-choice run map, and what still needs to happen before broader external testing or store upload. Keep `PROJECT_HANDOFF_2026-03-24.md` as the broad product/system handoff and `PROJECT_HANDOFF_2026-03-31.md` as the prior polish/readiness addendum.

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
- The active run flow has now had a deeper UX/gameplay pass:
  - each active floor now opens as a route-choice moment instead of a forced hallway
  - the run map shows a compact floor-progress strip and only the current floor's route options
  - future floors are no longer dumped as a wall of text
  - battle and reward screens now lead with the shortest useful decision view and hide secondary detail behind toggles
  - archived defeat recaps now preserve a concrete defeat summary:
    - encounter
    - enemy
    - intent
    - final exchange
    - live statuses
    - a suggested next-run adjustment
- `scripts/smoke-sim.cjs` was updated to validate the route-choice structure instead of assuming a strictly linear floor path.

## 2. What is now accurate about the app and repo

- The opening player experience now feels more intentional:
  - one assigned default class instead of a fake class-choice step
  - three default companions so the first team pick actually feels strategic
- The core run flow is now more readable on a phone:
  - the run map focuses on one current floor at a time
  - battle actions surface immediate tradeoffs first
  - reward selection centers the package choice before the paperwork
  - the heaviest explanatory text is hidden until the player asks for it
- Losses are more useful now:
  - archived failed runs explain what killed the player
  - the recap preserves the final exchange and live statuses
  - the recap now actively points the player toward a cleaner next-run idea
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

Validation note:

- the smoke sim is now deterministic and route-choice aware, so the guardrail reflects the current map structure instead of the earlier forced-path assumption

Fresh Android visual sweep previously performed on the current debug build:

- title screen: checked
- companion select: checked
- assigned-role / `class-select` fallback: checked
- settings: checked
- support: checked
- privacy: checked
- no-active-run `run-map` state: checked

Important note:

- The current source still needs a fresh on-device gameplay/readability regression after the new route-choice / compact-screen pass.
- The highest-priority manual Android routes are now:
  - run map route selection
  - battle readability and action clarity
  - reward readability and package choice clarity
  - event readability
  - end-run defeat summary
  - resume and relaunch behavior
  - native `dev-smoke`

## 4. What is still open after this pass

This pass did not finish the remaining release-facing or owner-only items:

- a focused Android gameplay regression on the current code/docs state after the route-choice and recap pass
- a fresh final signed build from a trustworthy environment if the Windows long-path rebuild issue still blocks final artifact generation here
- final public support inbox confirmation
- hosted public support and privacy URLs for store submission
- store screenshots, icon/art, short description, long description, ratings answers, and data-safety answers
- a small outside playtest on the current polished build
- internal or closed Google Play testing after that outside playtest prep is done

## 5. Best next move after this pass

The next highest-value step is no longer repo plumbing. It is product validation on the current source:

1. Run the focused Android gameplay regression on the new route-choice run map, battle, reward, event, end-run, resume, and `dev-smoke`.
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
- use this April 2 addendum for the current onboarding, route-choice gameplay/readability, GitHub-readiness, and repo-doc state
