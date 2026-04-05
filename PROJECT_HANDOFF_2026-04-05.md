# Dungeon Dive: Bad Decisions
## Release / GitHub Readiness Addendum

Version date: April 5, 2026  
Last refreshed: April 5, 2026 after the loop-readability, universal-design, local UX telemetry, validation, and GitHub-readiness pass.

Purpose: use this addendum as the current source of truth for the repo state after the April 5 polish/build pass. Keep `PROJECT_HANDOFF_2026-03-24.md` as the broad product/system handoff, `PROJECT_HANDOFF_2026-04-04.md` as the authored-voice snapshot, and this April 5 addendum as the latest release and repo-readiness layer.

## 1. What changed on April 5, 2026

- The loop-facing asset integration is now live on the highest-value runtime surfaces:
  - `app/run-map.tsx`
  - `app/event.tsx`
  - `app/reward.tsx`
  - `app/end-run.tsx`
- Shared loop-art infrastructure was added:
  - `src/assets/loop-art.ts`
  - `src/assets/loop-art-sources.ts`
  - `src/components/loop-art-panel.tsx`
- The current build now uses curated panel art to support route-choice, event, reward, and recap reads without redesigning the loop structure.
- Narrow-phone readability polish was applied across the duplicated compact stat-card pattern used on title, hub, run-map, battle, reward, event, end-run, progression, bonds, and codex surfaces.
- The shared loop-art panel was tightened so art sits with more breathing room inside the frame instead of feeling oversized on narrow phones.
- The highest-value gameplay screens now prioritize real decisions over process copy:
  - `Mission Brief` sits above route choice and defaults closed
  - route, event, reward, and recap art frames now read like portrait-card previews instead of wide banners
  - event class/crew reads and setup chemistry/role details now use progressive disclosure instead of front-loading non-essential text
  - title no longer shows a dead `Resume Dive` CTA when no active run exists
- Combat status language is now player-readable:
  - statuses now render as named effects with durations and summaries instead of shorthand like `Escalated (2)`
- Crew-channel repetition is reduced:
  - battle chatter now rotates across multiple variants keyed by encounter/state instead of feeling copy-pasted through a run
- Accessibility settings now have a live visible preview:
  - `High Contrast`, `Color Assist`, `Reduced Motion`, text sizing, and readability assists now have clearer visible consequences in `app/settings.tsx`
- Local-only UX telemetry now exists for validation work:
  - `src/state/uxTelemetryStore.ts` tracks runs started, route selection churn, first-floor route-commit timing, repeated crew-scene reuse, crew-scene views, and `Run It Back` taps
  - `app/dev-smoke.tsx` surfaces those metrics in a native-only `Smoke Lab` summary panel
- Public-facing support and privacy wording is now aligned:
  - `README.md`, `SUPPORT.md`, `PRIVACY_POLICY.md`, `app/support.tsx`, and `app/privacy.tsx` now consistently describe the offline/local-save product shape and the dev-only/local-only telemetry scope
- A real Android blocker was fixed for local native runs:
  - `scripts/expo-realpath.cjs` now resolves the real workspace path before invoking Expo
  - `package.json` now routes `start`, `android`, and `web` through that launcher
  - this prevents the earlier junction-path root-resolution failure that could break `expo-router/entry`
  - the Android path also reuses an already running Metro server on the expected port so the non-interactive port-prompt issue does not block `npm run android`

## 2. What is accurate about the app right now

- The project is still in release-candidate hardening mode and feature freeze should still hold.
- The current core loop remains:
  - title
  - class setup when multiple classes are unlocked, otherwise companion setup
  - run-map route choice
  - battle / reward / event
  - end-run archive recap
  - progression / hub / codex / bonds
- Fresh installs currently behave as expected:
  - no active run exists on first launch
  - the title screen shows `Start New Dive`
  - entering a new run moves into companion selection
- Existing saved-run resumes currently behave as expected:
  - cold relaunch returns the player to a valid saved-run resume point instead of dropping or corrupting state
- Settings/accessibility controls are now meaningfully testable in the app itself:
  - the settings screen includes a live preview block and preview buttons so visual changes are obvious before a run starts
- `dev-smoke` remains native-only and is now a better release-hardening tool:
  - final-boss near-win / near-loss seeding is still present
  - local-only UX telemetry summaries make it easier to validate opening clarity and restart impulse during manual QA
- The newly integrated runtime art is intentionally scoped:
  - loop-facing art is wired into the live game
  - the wider `src/assets` packs for audio and store media are present locally but are not yet wired into runtime systems
  - that is deliberate scope control, not an integration bug

## 3. Validation refreshed on April 5, 2026

Automated validation rerun on the current tree:

- `npx tsc --noEmit`: passed
- `npm run lint`: passed
- `npm run smoke:sim`: passed
- GitHub validation workflow still matches the local release gate:
  - `.github/workflows/validate.yml` runs `npm run lint`, `npx tsc --noEmit`, and `npm run smoke:sim`

Focused Android live verification completed on emulator:

- title screen loaded correctly
- saved-run resume entered reward flow successfully
- reward option selection and reward claim completed successfully
- reward claim returned to the run map successfully
- route choice entered an authored event successfully
- cold relaunch returned to a valid resume state on the current run

New manual follow-up is still recommended for the just-landed loop/readability pass:

- title -> start-new-dive clarity on a fresh profile
- class-select -> companion-select clarity when multiple classes are unlocked
- floor-1 route selection / route commit readability on phone hardware
- event decision readability with collapsed class/crew reads
- reward readability with selected package preview above the options
- settings live-preview visibility on target devices
- native-only `Smoke Lab` telemetry counters updating as expected
- support/privacy route copy matching the latest repo policy wording on-device

Fresh-install release APK verification also completed:

- `android/app/build/outputs/apk/release/app-release.apk` built successfully from the current source
- the release APK installed successfully after removing an older differently signed local build
- the fresh-install release build launched successfully
- the fresh-install release build entered the new-run companion-select flow successfully

## 4. Current release artifact status

- The canonical local release output for this pass is:
  - `android/app/build/outputs/apk/release/app-release.apk`
- A dated local tester copy was also produced in:
  - `release/dungeon-dive-bad-decisions-2026-04-05-release.apk`
- The local tester artifact is for distribution/testing convenience and should not be treated as a repo-tracked source file.
- If a tester already has an older local build signed with a different key, they may need to uninstall it before installing the current APK.

## 5. What remains before upload

The highest-value remaining work is still human validation and store completion, not new systems:

1. Run 3 to 5 outside Android testers on the current build.
2. Capture whether they can explain:
   - what kind of game this is
   - what their first meaningful choice was
   - what killed them
   - whether they wanted another run
   - whether the route, event, reward, and recap screens now feel clearer on first read
3. Finalize the public support inbox.
4. Finalize the public support URL and privacy-policy URL used for store submission.
5. Finalize Google Play listing copy, screenshots, icon treatment, and Data safety answers.
6. Move the current build into internal or closed Play testing.
7. Fix only blocker bugs or compliance issues found there.

## 6. Repo guidance after this pass

- Do not commit local tester APKs, emulator dumps, or scratch smoke artifacts.
- Keep gameplay logic out of UI where possible.
- Keep archive-backed recap behavior.
- Keep content IDs kebab-case.
- Keep `scripts/smoke-sim.cjs` aligned with system changes.
- Keep `src/state/uxTelemetryStore.ts` local-only unless the privacy model is intentionally expanded later.
- Keep feature freeze intact until outside testing or store review reveals a real blocker.

## 7. Source of truth after this pass

Use these docs together:

- `PROJECT_HANDOFF_2026-04-05.md`
- `PROJECT_HANDOFF_2026-04-05.docx`
- `DUNGEON_DIVE_APP_NEEDS_2026-04-05.docx`
- `PROJECT_HANDOFF_2026-04-04.md`
- `PROJECT_HANDOFF_2026-04-04.docx`
- `PROJECT_HANDOFF_2026-04-02.md`
- `PROJECT_HANDOFF_2026-03-31.md`
- `PROJECT_HANDOFF_2026-03-30.md`
- `PROJECT_HANDOFF_2026-03-27.md`
- `PROJECT_HANDOFF_2026-03-24.md`
- `README.md`
- `SUPPORT.md`
- `PRIVACY_POLICY.md`
- `.github/BRANCH_PROTECTION.md`

Simple rule:

- March 24 remains the broad product/system handoff
- April 4 remains the authored-voice / pre-regression snapshot
- April 5 is now the freshest release, tester-build, loop-readability, and GitHub-readiness snapshot
