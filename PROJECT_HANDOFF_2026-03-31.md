# Dungeon Dive: Bad Decisions
## GitHub Readiness and Polish Addendum

Version date: March 31, 2026
Last refreshed: March 31, 2026 after the repo-readiness sweep, full theme/accessibility parity rollout across the remaining gameplay routes, deeper class-tone propagation, support/privacy copy cleanup, and a fresh automated validation pass.

Purpose: Use this addendum as the latest source of truth for GitHub readiness, tester-facing polish, and current release-hardening status. Keep `PROJECT_HANDOFF_2026-03-24.md` for the broad product/system handoff, `PROJECT_HANDOFF_2026-03-27.md` for the earlier GitHub hookup pass, and `PROJECT_HANDOFF_2026-03-30.md` for the previous gameplay/docs addendum.

## 1. What changed on March 31, 2026

- The accessibility/theme rollout now covers the full main player/tester flow:
  - title
  - class select
  - companion select
  - run map
  - battle
  - reward
  - event
  - end-run recap
  - progression
  - hub
  - bonds
  - codex
  - support
  - privacy
  - native `dev-smoke`
- Those routes now read from the live saved profile for:
  - theme preset
  - text size
  - high contrast
  - reduced motion
  - color assist
  - dyslexia-friendly spacing
  - screen-reader hints
- The live settings route no longer implies that audio/language preferences exist as real saved gameplay options.
- The settings copy was refreshed so it matches the current state: route parity is broadly complete and the remaining work is smaller polish on secondary surfaces.
- Tester-facing placeholder-ish copy was cleaned up in:
  - `README.md`
  - `SUPPORT.md`
  - `PRIVACY_POLICY.md`
  - the settings route
- The sharper `Crown Meridian Holdings` / `Project Everrise` / `Meridian Spire` tone was pushed further through older meta/reference writing and authored companion content.
- GitHub readiness is stronger:
  - `.github/workflows/validate.yml` now exposes a stable required check named `validate`
  - `.github/BRANCH_PROTECTION.md` documents the exact manual rule to turn on for `main`
  - `README.md` now points directly at that runbook
- A new March 31 app-needs document now replaces the stale March 30 summary for release planning.

## 2. What is now accurate about the app and repo

- The app now presents a much more consistent live accessibility/theme experience across the real run flow instead of only on shell screens.
- The saved settings people can see in the UI are real runtime settings, not future-feature promises.
- The main docs no longer tell testers that a broad palette rollout is still pending across the primary routes.
- The support/privacy drafts no longer expose the old placeholder support email in tester-facing copy.
- The current repo has a clear branch-protection setup path, but the GitHub branch rule itself still must be turned on manually in repository settings.

## 3. Validation refreshed on March 31, 2026

Fresh automated checks performed during this pass:

- `npx tsc --noEmit`: passed
- `npm run lint`: passed
- `npm run smoke:sim`: passed

Important note:

- The automated gate is green on the March 31 code/docs state.
- Manual Android validation already completed on the prior release-candidate build according to the project owner.
- Because this pass still changed UI, copy, and route-level styling, the next human validation should be a shorter release-candidate regression focused on the polished build future testers will actually see.

## 4. Owner-confirmed release status that should now be treated as current

- A full manual 10-floor Android release-build playthrough has already been completed on the prior candidate.
- The project should still stay in feature freeze.
- The current goal is a more polished playtester-facing build, not new systems.
- Future release-candidate validation should focus on:
  - the current polished build
  - route readability under multiple theme presets
  - accessibility setting persistence across relaunch
  - the already-validated run flow staying intact after polish changes

## 5. What is still open after this pass

This pass did not finish the following launch-blocking or owner-only items:

- manually enabling GitHub branch protection on `main`
- finalizing the public support inbox
- hosting final support and privacy URLs for store submission
- finishing store screenshots, store copy, icon, ratings answers, and privacy/data-safety answers
- running a small outside playtest on the newer polished build
- confirming whether the Windows long-path native rebuild blocker still affects fresh final artifacts

## 6. Best next move after this pass

The next highest-value product step is not more feature work. It is:

1. Turn on the GitHub `main` branch rule using `.github/BRANCH_PROTECTION.md`.
2. Build or install the current polished candidate that includes the March 31 route/theme/copy updates.
3. Run a focused Android regression across title, setup, map, battle, reward, event, recap, resume, and `dev-smoke` on that polished build.
4. Fix only real blocker issues found there.
5. Finish store/support submission materials and move into outside playtesting or closed testing.

## 7. Source of truth after this pass

Use these docs together:

- `PROJECT_HANDOFF_2026-03-31.md`
- `PROJECT_HANDOFF_2026-03-30.md`
- `PROJECT_HANDOFF_2026-03-27.md`
- `PROJECT_HANDOFF_2026-03-24.md`
- `DUNGEON_DIVE_APP_NEEDS_2026-03-31.md`
- `README.md`
- `SUPPORT.md`
- `PRIVACY_POLICY.md`

Simple rule:

- use March 24 for the broad product/system handoff
- use March 27 for the initial GitHub hookup / policy pass
- use March 30 for the previous gameplay/docs addendum
- use this March 31 addendum for the current polished GitHub-ready state
