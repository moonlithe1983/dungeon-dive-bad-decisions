# Dungeon Dive: Bad Decisions
## GitHub Readiness / Source-of-Truth Refresh Addendum

Version date: April 14, 2026  
Last refreshed: April 14, 2026 after a full GitHub-readiness re-check, documentation consistency sweep, and validation rerun.

Purpose: use this addendum as the current source of truth for the repo state after the April 14 GitHub-readiness pass. Keep `PROJECT_HANDOFF_2026-03-24.md` as the broad product/system handoff, `PROJECT_HANDOFF_2026-04-04.md` as the authored-voice snapshot, `PROJECT_HANDOFF_2026-04-08.md` as the latest runtime/release-feature snapshot, and this April 14 addendum as the latest repo/docs/validation state.

## 1. What changed on April 14, 2026

- No new gameplay/runtime features landed after the April 8 readiness snapshot.
- The April 14 pass re-checked the live repo surfaces against the current docs:
  - `app/index.tsx`
  - `app/onboarding.tsx`
  - `app/class-select.tsx`
  - `app/companion-select.tsx`
  - `app/run-map.tsx`
  - `app/battle.tsx`
  - `app/settings.tsx`
  - `app/dev-smoke.tsx`
  - `app/support.tsx`
  - `app/privacy.tsx`
  - `.github/workflows/validate.yml`
- Source-of-truth docs were rolled forward to April 14:
  - `README.md` now points at the April 14 handoff / app-needs artifacts
  - `SUPPORT.md` and `PRIVACY_POLICY.md` now carry the April 14 refresh date
  - `SUPPORT.md` pricing language now matches the current premium release gate instead of implying a default upgrade path to `US$4.99`
  - helper docs that referenced the April 8 handoff as current source of truth now point at April 14
- No new tester APK was generated during this pass because runtime source was unchanged:
  - the latest dated outside-share build remains `release/dungeon-dive-bad-decisions-android-tester-2026-04-08.apk`

## 2. What is accurate about the app right now

- The project is still in release-candidate hardening mode and feature freeze should still hold.
- The current live loop is still:
  - title
  - first-run onboarding intro / interactive orientation sim
  - class-select assigned-role briefing
  - companion-select
  - run-map route choice
  - battle / reward / event
  - end-run archive recap
  - progression / hub / codex / bonds
- The app is still offline-first in public gameplay terms:
  - no account requirement
  - no cloud sync
  - no normal-play telemetry intentionally sent to Moonlithe-operated services by default
- The current source still contains a vendor-neutral remote analytics validation path:
  - it is only surfaced through `app/dev-smoke.tsx`
  - it requires explicit endpoint configuration through public environment values
  - it remains a development / QA validation path, not the default public gameplay model
- The live settings route still matches the accessibility and input claims in the docs:
  - theme preset selection
  - text sizing
  - contrast / motion / readability toggles
  - master and per-channel audio sliders
  - dominant-hand bias
  - controller-style hint visibility
  - battle action-order remapping
- Combat is still fundamentally turn-based:
  - the live battle route includes a real `dodge` action
  - the action improves defensive tempo and setup play
  - the game is still not a movement / aim / dodge action roguelite in the spec sense
- The April 8 tester-share APK is still the current dated build to hand to outside testers until runtime source changes again.

## 3. Validation refreshed on April 14, 2026

Automated validation rerun on the current tree:

- `npx tsc --noEmit`: passed
- `npm run audit:classes`: passed
- `npm run lint`: passed
- `npm run smoke:sim`: passed
- GitHub validation workflow still matches the local gate:
  - `.github/workflows/validate.yml` runs `npm run lint`, `npx tsc --noEmit`, `npm run audit:classes`, and `npm run smoke:sim`

Notes:

- The working tree was clean before this documentation refresh began.
- No code/docs mismatch was found in the current app surfaces that required a runtime fix during this pass.
- The main GitHub-readiness outcome of the April 14 pass is that the repo, docs, and validation story are now aligned around the current release candidate rather than the older April 8 source-of-truth references.

## 4. Current release artifact status

- The canonical local Android release output path remains:
  - `android/app/build/outputs/apk/release/app-release.apk`
- The latest dated tester-share copy already in the repo workspace remains:
  - `release/dungeon-dive-bad-decisions-android-tester-2026-04-08.apk`
- Rebuild again only if runtime source changes after this April 14 docs/validation refresh.

## 5. What remains before upload

The highest-value remaining work is still outside validation, launch-proof, and blocker-only follow-through rather than new feature work.

Premium release gate: do not ship at `US$3.99` until pacing, post-first-win stickiness, and long-tail retention meet the targets in `docs/launch-postlaunch-retention-plan.md`. If that bar is not met, revisit a free route with optional paid upgrades, future games, or extras instead of shipping weak premium value.

1. Share the already-built April 8 tester APK for the next outside smoke wave unless runtime source changes again first.
2. Run guided first-session tests with outside players on real Android phones and confirm they can install, finish the opening loop, and explain why they would play again without coaching.
3. If testers show confusion but interest, fix onboarding / clarity and stay inside feature freeze.
4. If testers show interest but weak willingness to pay upfront, pivot monetization / positioning rather than rebuilding the app.
5. If testers understand the loop but still do not find it compelling, consider a deeper redesign or restart.
6. After any runtime source change, rerun a focused Android sanity pass covering:
   - title
   - first-run onboarding
   - class briefing
   - companion select
   - run map
   - battle with the remapped action stack visible
   - reward / event
   - cold relaunch resume
   - end-run
7. Decide whether hardware controller input remains explicitly post-launch or becomes a release blocker.
8. Decide whether launch uses verified production analytics / crash reporting or an explicit low-data / no-production-telemetry approach backed by strong guided testing and manual release evidence.
9. Finalize the public support inbox, any hosted support/privacy URLs, Play listing copy, screenshots, feature graphic, and Data safety answers.
10. Fix only blocker bugs or compliance issues found during outside testing or store prep.

## 6. Repo guidance after this pass

- Do not commit local tester APKs, emulator dumps, or scratch smoke artifacts.
- Keep gameplay logic out of UI where possible.
- Keep archive-backed recap behavior.
- Keep content IDs kebab-case.
- Keep `scripts/smoke-sim.cjs` aligned with system changes.
- Keep `scripts/audit-class-support.cjs` aligned with the real class-extension requirements so post-launch additions fail loudly when support surfaces are missing.
- Keep `src/state/uxTelemetryStore.ts` local-only unless the privacy model is intentionally expanded later.
- Keep the remote analytics adapter vendor-neutral until a real backend decision is made.
- Keep feature freeze intact until outside testing or store review reveals a real blocker.

## 7. Source of truth after this pass

Current canonical docs:

- `PROJECT_HANDOFF_2026-04-14.md`
- `PROJECT_HANDOFF_2026-04-14.docx`
- `DUNGEON_DIVE_APP_NEEDS_2026-04-14.docx`
- `docs/launch-postlaunch-retention-plan.md`
- `Build_a_Viable_Expo_App.md`
- `README.md`
- `SUPPORT.md`
- `PRIVACY_POLICY.md`
- `docs/class-extension-checklist.md`
- `docs/design-spec-audit.md`
- `.github/BRANCH_PROTECTION.md`

Historical background only when needed:

- `PROJECT_HANDOFF_2026-04-08.md`
- `PROJECT_HANDOFF_2026-04-07.md`
- `PROJECT_HANDOFF_2026-04-04.md`
- `PROJECT_HANDOFF_2026-03-24.md`

Canonical local repo root:

- `C:\ddbd`
- use `C:\ddbd` in docs, references, and handoff notes
