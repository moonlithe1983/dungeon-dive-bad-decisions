# Dungeon Dive: Bad Decisions
## GitHub Readiness Addendum

Version date: March 27, 2026
Last refreshed: March 27, 2026 after the GitHub repo hookup, the proprietary-license decision pass, the launch-default recommendation pass, the honest-settings cleanup, the support/privacy draft-page addition, the GitHub Actions validation workflow addition, the Android-only copy alignment pass, a native app-label cleanup, a smoke-sim CI-hardening pass, a fresh automated validation rerun, and a live Android emulator smoke pass.

Purpose: This is a short addendum to the full March 24 handoff. Use this file when you need the current repo-readiness snapshot for GitHub, documentation alignment, and the latest automated-check status. Use `PROJECT_HANDOFF_2026-03-24.md` for the full product/system handoff.

## 1. What changed on March 27, 2026

- The local folder is now a real Git repository and is connected to:
  - `https://github.com/moonlithe1983/dungeon-dive-bad-decisions`
- The initial project import commit was created and pushed to `origin/main`.
- `.gitignore` was already corrected during the GitHub hookup so the native `android/` source project stays versioned while local-only items stay excluded.
- The repo now includes a clear proprietary `LICENSE.md` notice so the public GitHub repository is not casually mistaken for an open-source grant.
- The repo now includes a GitHub Actions validation workflow at `.github/workflows/validate.yml`.
- The README release section was updated so it matches the current known release state more accurately.
- The live `settings` route no longer exposes unwired audio/content toggles as fake controls.
- The Android display name now matches the real product title (`Dungeon Dive: Bad Decisions`) instead of the repo slug.
- `app/dev-smoke.web.tsx` now matches the current Android-only scope instead of implying iOS is still an active target.
- `scripts/smoke-sim.cjs` was hardened after a GitHub Actions failure so authored combat assertions compare logged damage / healing / retaliation effects instead of brittle clamped end-state HP.
- Retaliation-sensitive smoke cases now use a durable temporary enemy HP pool inside the test harness so overkill does not accidentally skip the retaliation checks the test is trying to verify.
- New draft support/privacy routes and matching markdown docs now exist:
  - `app/support.tsx`
  - `app/privacy.tsx`
  - `SUPPORT.md`
  - `PRIVACY_POLICY.md`
- Working launch defaults were tightened during this pass:
  - platform: Android only
  - store: Google Play only
  - public developer name: `Moonlithe`
  - working launch regions: United States, United Kingdom, Canada, Australia, New Zealand, and Ireland
  - working launch price default: `US$3.99` unless external testing later clearly supports `US$4.99`
- One owner-owned decision still remains blocked:
  - the final public support inbox still needs confirmation before store submission

## 2. What was freshly re-validated on March 27, 2026

Fresh automated checks performed during this pass:

- `npx tsc --noEmit`: passed
- `npm run lint`: passed
- `npm run smoke:sim`: passed
- `npm run smoke:sim` repeated local reruns after the CI-hardening patch: 8 consecutive passes

Fresh live Android emulator smoke completed on March 27, 2026:

- starting point:
  - resumed active run on the reward/title path and returned cleanly to the title screen
- title flow confirmed:
  - title screen rendered correctly with resumable-run state visible
- resumed-run flow confirmed:
  - resume -> floor 1 event -> live authored event choices rendered correctly
- event resolution confirmed:
  - choosing `Audit The Possession` advanced the run into floor 2 without state loss
- floor-transition/map handoff confirmed:
  - floor 2 deployment/map screen rendered correctly with updated node, inventory, and companion state
- battle flow confirmed:
  - entered `Compliance Ambush`, executed real combat turns, saw HP/status/combat-log updates, and resolved the fight successfully
- reward flow confirmed:
  - reward screen rendered correctly, `Claim Reward` applied healing + item pickup, and the run returned to the map with updated inventory (`Suspicious KPI Dashboard, Motivational Katana`) and healed HP (`37/38`)
- environment note:
  - one brief Expo developer-menu interruption came from another installed dev app on the emulator (`com.moonlithe.walkthroughlog`), not from `com.moonlithe.dungeondivebaddecisions`; rerunning the same reward-claim step with focus pinned to this game succeeded

Fresh `smoke:sim` sample output from March 27, 2026:

- victorious run ID:
  - `run-1774631026035-gbh0qzyl`
- completed run status:
  - `completed`
- rewards claimed:
  - `13`
- meta currency at end of the scripted victory path:
  - `82`
- purchased class in the scripted path:
  - `customer-service-rep`
- purchased companion in the scripted path:
  - `security-skeleton`
- final hero HP:
  - `44 / 44`
- defeat branch status:
  - `failed`
- traversed nodes:
  - `20`

Important validation note:

- The exact unlocked item/event list in `smoke:sim` can still vary as content selection changes.
- The durable pass/fail gate is still the acceptance logic inside `scripts/smoke-sim.cjs`, not any single sample reward list.

## 3. What is now accurate about the repo state

Current repo-readiness truth:

- The repo is now safe to use as the GitHub source of truth for the project.
- The committed source includes the native Android project.
- The native Android app label now matches the product title instead of the internal slug.
- Local build folders, emulator artifacts, local logs, local editor folders, `node_modules`, and Android signing material remain excluded from version control.
- Local Android release outputs still exist under `android/app/build/outputs`.
- The repo docs now point to the latest handoff set instead of the stale March 23 handoff.
- The public GitHub repo is now paired with an explicit proprietary license notice instead of leaving the reuse question ambiguous.
- The live settings screen now hides unfinished toggles rather than leaving misleading controls visible.
- The smoke simulation is now a more trustworthy CI gate because its authored combat assertions no longer depend on clamped HP comparisons that can flatten on overkill.
- Draft support/privacy content now exists inside the repo and app shell, even though the final public support email and public hosting URL still need owner confirmation.

## 4. What did not change during this pass

This pass did not newly prove any of the following:

- a full 10-floor Android release-build manual playthrough
- a fresh successful Windows release rebuild after the March 24 reward-diagnostic patch
- store metadata completion
- external playtest completion
- the final public support email / monitored inbox
- GitHub branch protection that requires CI before merges into `main`

Those remain open exactly as described in `PROJECT_HANDOFF_2026-03-24.md`.

## 5. Current best read after this pass

Current project status in one paragraph:

The repo is now GitHub-ready, the docs are better aligned with the actual current release situation, the public repository now has an explicit proprietary license notice, the live settings screen no longer exposes fake controls, draft support/privacy pages now exist, the Android display name now matches the real game title instead of the repo slug, the smoke simulation has been hardened against the GitHub Actions flake caused by clamped HP comparisons, the core automated gates still pass as of March 27, 2026, and the live Android dev-build smoke path has now been manually re-confirmed through resume, event choice, floor transition, battle, reward claim, and map return. No reproducible gameplay defect was uncovered during this pass. The project still remains in release-candidate hardening mode rather than feature-development mode. The most important remaining work is now one full Android release-build manual validation run, resolving or working around the Windows long-path rebuild blocker if a fresh signed artifact is needed from this machine, locking the final public support inbox, turning on branch protection that requires CI, and finishing store-prep work under the existing no-new-scope rule.

## 6. Source of truth after this pass

Use these docs together:

- `PROJECT_HANDOFF_2026-03-27.md`
- `PROJECT_HANDOFF_2026-03-24.md`
- `README.md`
- `SUPPORT.md`
- `PRIVACY_POLICY.md`

Simple rule:

- use the March 24 handoff for the full game/product/system picture
- use this March 27 addendum for the latest GitHub/readiness/validation update
