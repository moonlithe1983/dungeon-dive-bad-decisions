# Dungeon Dive: Bad Decisions
## GitHub Readiness / Tester Build Addendum

Version date: April 7, 2026  
Last refreshed: April 7, 2026 after the first-run onboarding/readability pass, Play icon finalization, tester-build regeneration, and GitHub-readiness sweep.

Purpose: use this addendum as the current source of truth for the repo state after the April 7 release-hardening pass. Keep `PROJECT_HANDOFF_2026-03-24.md` as the broad product/system handoff, `PROJECT_HANDOFF_2026-04-04.md` as the authored-voice snapshot, `PROJECT_HANDOFF_2026-04-06.md` as the prior tester-build layer, and this April 7 addendum as the latest tester-build / repo-readiness layer.

## 1. What changed on April 7, 2026

- Fresh-profile onboarding is now clearer and persistent:
  - profile state now tracks whether the first-run narrative intro has been seen
  - the title screen now explains who the player is, what Meridian Spire is, why the ticket matters, and why companions matter before the first dive
  - new dives now route through `app/class-select.tsx` even when only IT Support is unlocked so the role briefing is never skipped
- Companion setup now carries decision-critical context directly on-screen:
  - `app/companion-select.tsx` now includes a `Role Snapshot` block above the companion cards
  - the active-vs-reserve pick order is explained before the player commits the crew
- Run-map decision support is more explicit:
  - `app/run-map.tsx` now explains the floor objective in plain language instead of leaving route progression implied
  - must-know run information now sits in a `Decision Support` panel above the route choice
  - reward waiting states now present one honest forward path instead of fake branch CTAs
- Combat readability was materially improved:
  - `app/battle.tsx` now returns focus to a `Last Exchange` summary after each action
  - the result summary now explains HP and status interpretation directly where the player needs it
  - the combat log now reinforces the same turn outcome instead of hiding it beneath the action list
- Currency and reward language are cleaner:
  - surfaced `scrap` references were normalized to `Chits` where they represent the persistent reward currency
  - `app/reward.tsx` no longer pretends a mandatory reward claim is a branching choice
  - single-option rewards now read as a current payout instead of a fake "selected package"
- Post-run guidance is clearer:
  - `app/end-run.tsx` now uses `Start Another Dive` instead of `Run It Back`
  - archived defeat summaries now surface plain-language status explanations when present
- Shared art and brand treatment were finalized:
  - `src/components/loop-art-panel.tsx` now frames portrait art more intentionally inside the shared panel
  - Expo placeholder icon/splash/favicon assets were removed from `assets/images`
  - `app.json` now points the app icon, adaptive icon, splash image, and web favicon at the approved DDBD Play icon export in `src/assets/store/png/icon`
  - store-manifest docs now treat the approved Play icon and feature graphic PNG exports as canonical

## 2. What is accurate about the app right now

- The project is still in release-candidate hardening mode and feature freeze should still hold.
- The current core loop remains:
  - title
  - class-select assigned-role briefing
  - companion-select
  - run-map route choice
  - battle / reward / event
  - end-run archive recap
  - progression / hub / codex / bonds
- Fresh installs now behave as follows:
  - no active run exists on first launch
  - the title screen shows `Start Your First Dive`
  - the first-run title surface includes an onboarding explainer before the usual top-menu behavior becomes primary
  - entering a new run routes into the assigned-role briefing before crew selection
- Route-choice behavior is now clearer than the April 6 snapshot:
  - the run map explicitly tells the player that clearing one active room advances the floor
  - the alternate room is described as another path, not another requirement
  - must-know run information now appears above the route-entry decision
- Combat and reward behavior are currently accurate to the live code:
  - action resolution returns the player to a visible turn-summary area before the next choice
  - battle victories still route into reward claim before the run advances
  - pending reward resumes still return to reward claim after a cold relaunch
  - reward claim returns the player to the run map cleanly
- The app remains offline-first and local-save only:
  - no account requirement
  - no cloud sync
  - no gameplay telemetry sent to Moonlithe as part of the current product shape
- `dev-smoke` remains native-dev only:
  - it still supports seeded final-boss near-win / near-loss checks
  - it still exposes local-only UX telemetry for manual QA only
- The repo’s Play-branding state is now internally consistent:
  - the approved Play icon export is the canonical runtime/store icon source
  - the approved feature graphic export is the canonical Play feature graphic source

## 3. Validation refreshed on April 7, 2026

Automated validation rerun on the current tree:

- `npx tsc --noEmit`: passed
- `npm run lint`: passed
- `npm run smoke:sim`: passed
- GitHub validation workflow still matches the local gate:
  - `.github/workflows/validate.yml` runs `npm run lint`, `npx tsc --noEmit`, and `npm run smoke:sim`

Focused Android live verification completed on emulator against the fresh April 7 release APK:

- fresh-install title screen loaded correctly
- `Start Your First Dive` entered the assigned-role setup flow correctly
- class briefing and companion-select completed successfully
- run-map route selection and route entry completed successfully
- battle completed successfully
- reward screen loaded successfully after combat
- cold relaunch returned to a valid reward-resume state
- reward claim completed successfully after resume
- run-map remained healthy after reward claim
- abandon flow archived successfully into end-run

This is the current highest-confidence live release-build loop pass for the repo.

## 4. Current release artifact status

- The canonical local release output for this pass is:
  - `android/app/build/outputs/apk/release/app-release.apk`
- A dated tester-share copy was produced in:
  - `release/dungeon-dive-bad-decisions-android-tester-2026-04-07.apk`
- The current tester-share APK hash is:
  - `CA6E59927EE01C67732BE100FB344394FFB6BC2D06FE7A669BF123DAB0549369`
- The local tester artifact is for distribution/testing convenience and should not be treated as a repo-tracked source file.
- If a tester already has an older locally signed or differently signed build, they may need to uninstall it before installing the current APK.

## 5. What remains before upload

The highest-value remaining work is still outside testing, store completion, and blocker triage, not new systems:

1. Run 3 to 5 outside Android testers on the April 7 tester APK.
2. Capture whether they can explain:
   - what kind of game this is
   - what their first meaningful choice was
   - what happened in the first fight
   - whether reward claim and resume behavior felt obvious
   - whether the route, battle, reward, and recap screens now feel clearer on first read
   - whether the new first-run intro actually improves understanding
3. Finalize the public support inbox.
4. Finalize the public support URL and privacy-policy URL used for store submission.
5. Finalize Google Play listing copy, screenshots, and Data safety answers.
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

- `PROJECT_HANDOFF_2026-04-07.md`
- `PROJECT_HANDOFF_2026-04-07.docx`
- `DUNGEON_DIVE_APP_NEEDS_2026-04-07.docx`
- `PROJECT_HANDOFF_2026-04-06.md`
- `PROJECT_HANDOFF_2026-04-06.docx`
- `PROJECT_HANDOFF_2026-04-05.md`
- `PROJECT_HANDOFF_2026-04-05.docx`
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
- April 6 remains the prior tester-build and ticket-flavor snapshot
- April 7 is now the freshest tester-build, onboarding/readability, Play-branding, live-validation, and GitHub-readiness snapshot
