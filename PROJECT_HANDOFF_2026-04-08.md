# Dungeon Dive: Bad Decisions
## GitHub Readiness / Release-Hardening Addendum

Version date: April 8, 2026  
Last refreshed: April 8, 2026 after the interactive-FTUE expansion, audio-accessibility expansion, input-remapping/controller-readiness pass, dodge-action combat pass, remote-analytics validation scaffold, and documentation alignment sweep.

Purpose: use this addendum as the current source of truth for the repo state after the April 8 GitHub-readiness pass. Keep `PROJECT_HANDOFF_2026-03-24.md` as the broad product/system handoff, `PROJECT_HANDOFF_2026-04-04.md` as the authored-voice snapshot, `PROJECT_HANDOFF_2026-04-07.md` as the prior tester-build/readability layer, and this April 8 addendum as the latest repo-readiness / controls / analytics-validation layer.

## 1. What changed on April 8, 2026

- First-session onboarding is now genuinely interactive:
  - `app/onboarding.tsx` now teaches the loop through a guided mini-run instead of relying on a static briefing alone
  - the first-run path is now effectively title -> interactive orientation sim -> class briefing -> companion select -> run map
  - the static packet still exists as a replayable briefing mode from Settings and Codex
- Audio accessibility moved closer to the design spec:
  - profile settings now persist master, SFX, music, voice, and ambient volume channels
  - `app/settings.tsx` now exposes those channels with honest “live now” versus “profile-ready” language
  - live UI cue playback currently respects master and SFX levels
- Input accessibility improved materially:
  - profile settings now persist dominant-hand bias, controller-style hint visibility, and combat action order
  - `app/settings.tsx` now lets the player reorder battle actions directly
  - `app/battle.tsx` now renders the action list in that saved order and shows controller-style hint badges when enabled
- Combat moved one real step closer to the action thesis without pretending the game is now a full action roguelite:
  - combat now includes a real `dodge` action
  - the new action trades offensive pressure for retaliation reduction, setup damage, and tempo control
  - combat banter and action descriptions were updated so `dodge` reads like a first-class choice instead of a hidden modifier
- Analytics are no longer only local-schema scaffolding:
  - `src/analytics/http-adapter.ts` adds a vendor-neutral fetch-based analytics adapter
  - `src/analytics/remote-config.ts` reads optional public env config for endpoint, API key, and source
  - `app/dev-smoke.tsx` now exposes remote analytics validation and flush controls in dev builds
  - the remote analytics path remains dev-only and inert unless explicitly configured
- Documentation was brought back into line with the current app:
  - `README.md` now points at the April 8 handoff/app-needs artifacts
  - `SUPPORT.md`, `PRIVACY_POLICY.md`, `app/support.tsx`, and `app/privacy.tsx` now describe the dev-only analytics validation path honestly
  - `docs/design-spec-audit.md` now reflects the improved but still partial state of remapping, dodge-combat progress, and remote analytics validation

## 2. What is accurate about the app right now

- The project is still in release-candidate hardening mode and feature freeze should still hold.
- The current live loop is:
  - title
  - interactive onboarding tutorial for fresh profiles
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
- The current source *does* contain a vendor-neutral remote analytics validation path:
  - it is only surfaced through `app/dev-smoke.tsx`
  - it requires explicit endpoint configuration through public environment values
  - it is for development / QA validation, not the default public gameplay model
- Input and readability are stronger than the April 7 snapshot:
  - the battle action list can now be reordered through saved profile settings
  - the UI can show controller-style action hints
  - handedness bias is now persisted and reflected in battle action presentation
- Combat is still fundamentally turn-based:
  - the new `dodge` action improves tempo and defensive choice-making
  - the game is not yet a movement/aim/dodge action roguelite in the spec sense

## 3. Validation refreshed on April 8, 2026

Automated validation rerun on the current tree:

- `npx tsc --noEmit`: passed
- `npm run lint`: passed
- `npm run smoke:sim`: passed
- GitHub validation workflow still matches the local gate:
  - `.github/workflows/validate.yml` runs `npm run lint`, `npx tsc --noEmit`, and `npm run smoke:sim`

Notes:

- This April 8 pass was a repo/code/docs readiness sweep, not a new Android tester-build generation pass.
- The latest verified local tester-build snapshot still remains the April 7 release-build emulator pass described in `PROJECT_HANDOFF_2026-04-07.md`.

## 4. Current release artifact status

- The canonical local Android release output path remains:
  - `android/app/build/outputs/apk/release/app-release.apk`
- The latest dated tester-share copy already in the repo workspace remains:
  - `release/dungeon-dive-bad-decisions-android-tester-2026-04-07.apk`
- No new APK was generated as part of this April 8 GitHub-readiness pass.
- If a fresh outside-tester artifact is needed after the April 8 source changes, rebuild from the current source and repeat the Android release sanity pass before distribution.

## 5. What remains before upload

The highest-value remaining work is still human validation, final release packaging, and choosing which “partial” systems stay partial for first release:

1. Rebuild a fresh Android release APK from the current April 8 source before any new tester wave.
2. Run a focused Android sanity pass covering:
   - title
   - first-run onboarding
   - class briefing
   - companion select
   - run map
   - battle with the remapped action stack visible
   - reward / event
   - cold relaunch resume
   - end-run
3. Decide whether hardware controller input remains explicitly post-launch or becomes a release blocker.
4. Decide whether the remote analytics adapter remains dev-only for first release or gets connected to a real production backend before launch.
5. Finalize the public support inbox and any hosted support/privacy URLs needed for Play submission.
6. Finalize Google Play listing copy, screenshots, feature graphic, and Data safety answers.
7. Fix only blocker bugs or compliance issues found there.

## 6. Repo guidance after this pass

- Do not commit local tester APKs, emulator dumps, or scratch smoke artifacts.
- Keep gameplay logic out of UI where possible.
- Keep archive-backed recap behavior.
- Keep content IDs kebab-case.
- Keep `scripts/smoke-sim.cjs` aligned with system changes.
- Keep `src/state/uxTelemetryStore.ts` local-only unless the privacy model is intentionally expanded later.
- Keep the remote analytics adapter vendor-neutral until a real backend decision is made.
- Keep feature freeze intact until outside testing or store review reveals a real blocker.

## 7. Source of truth after this pass

Use these docs together:

- `PROJECT_HANDOFF_2026-04-08.md`
- `PROJECT_HANDOFF_2026-04-08.docx`
- `DUNGEON_DIVE_APP_NEEDS_2026-04-08.docx`
- `PROJECT_HANDOFF_2026-04-07.md`
- `PROJECT_HANDOFF_2026-04-07.docx`
- `PROJECT_HANDOFF_2026-04-06.md`
- `PROJECT_HANDOFF_2026-04-06.docx`
- `PROJECT_HANDOFF_2026-04-04.md`
- `PROJECT_HANDOFF_2026-04-02.md`
- `PROJECT_HANDOFF_2026-03-31.md`
- `PROJECT_HANDOFF_2026-03-30.md`
- `PROJECT_HANDOFF_2026-03-27.md`
- `PROJECT_HANDOFF_2026-03-24.md`
- `README.md`
- `SUPPORT.md`
- `PRIVACY_POLICY.md`
- `docs/design-spec-audit.md`
- `.github/BRANCH_PROTECTION.md`

Simple rule:

- March 24 remains the broad product/system handoff
- April 4 remains the authored-voice / pre-regression snapshot
- April 7 remains the prior tester-build/readability snapshot
- April 8 is now the freshest repo-readiness, controls/remapping, dodge-combat, analytics-validation, and documentation-alignment snapshot
