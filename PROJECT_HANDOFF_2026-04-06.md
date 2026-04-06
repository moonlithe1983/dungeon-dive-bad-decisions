# Dungeon Dive: Bad Decisions
## GitHub Readiness / Tester Build Addendum

Version date: April 6, 2026  
Last refreshed: April 6, 2026 after the ticket-flavor pass, boss-reward flow fix, in-run Codex access pass, Android tester-build verification, and GitHub-readiness sweep.

Purpose: use this addendum as the current source of truth for the repo state after the April 6 release-hardening pass. Keep `PROJECT_HANDOFF_2026-03-24.md` as the broad product/system handoff, `PROJECT_HANDOFF_2026-04-04.md` as the authored-voice snapshot, `PROJECT_HANDOFF_2026-04-05.md` as the prior release-readiness layer, and this April 6 addendum as the latest tester-build / repo-readiness layer.

## 1. What changed on April 6, 2026

- A real progression blocker in the combat-to-reward flow was fixed:
  - battle victories now persist a pending reward and route into `app/reward.tsx` before the run advances
  - this prevents the abrupt no-payout resolution that surfaced around the HR boss path
  - the run no longer lands in a half-advanced floor state before the reward is claimed
- Title-return wording was clarified across the app:
  - `Return to Title` was replaced with `Employee Portal`
  - this is now consistent across loop routes, recap routes, codex, support/privacy, progression, hub, and dev-smoke surfaces
- The Codex is now accessible during live play:
  - run-map, battle, event, and reward now expose in-run Codex entry points
  - `app/codex.tsx` now supports returning directly to the active run surface instead of forcing a trip through the top menu
- The run now has explicit ticket framing instead of relying on implied escalation flavor:
  - setup, run-map, battle, reward, and end-run now surface the active ticket ID, subject, escalation track, and current owner
  - `src/content/company-lore.ts` now owns class-aware ticket briefs, stage-aware escalation copy, and result-aware ticket outcome text
- Failure and recap writing are now more specific:
  - archive outcomes and defeat summaries now reflect where the ticket died, not just that the run failed
  - end-run now foregrounds a `Ticket Record` panel plus result-aware archive headings like `Closure Note`, `Reopen Conditions`, and `Postmortem Directive`
- Resume messaging is now more specific:
  - the title CTA reflects the actual saved scene, such as `Resume Reward - Floor 1`, instead of only a generic dive-resume label
- Run-map crew notes now better explain carried gear:
  - the in-run reference panel now surfaces item effect summaries so inventory earns are easier to parse without leaving the loop
- Git cleanliness was tightened for GitHub readiness:
  - `.gitignore` now ignores the current local smoke screenshot naming patterns and the temporary app-needs scratch folder

## 2. What is accurate about the app right now

- The project is still in release-candidate hardening mode and feature freeze should still hold.
- The current core loop remains:
  - title
  - class-select when multiple classes are unlocked, otherwise companion-select
  - run-map route choice
  - battle / reward / event
  - end-run archive recap
  - progression / hub / codex / bonds
- The live player-facing framing is sharper than the April 5 snapshot:
  - `Employee Portal` now reads as a safe menu return instead of an exit-risk button
  - ticket framing now gives setup, combat, reward, and recap surfaces a shared narrative spine
  - the Codex is available in-run instead of being stranded at top-menu level
  - carried item effects are easier to inspect during a run
- Save/resume behavior is currently accurate to the live code:
  - pending rewards resume back into reward claim
  - route selection resumes back into run-map
  - resume CTA labels reflect the actual pending scene type
- The app remains offline-first and local-save only:
  - no account requirement
  - no cloud sync
  - no gameplay telemetry sent to Moonlithe as part of the current product shape
- `dev-smoke` remains native-dev only:
  - it still supports seeded final-boss near-win / near-loss checks
  - it still exposes local-only UX telemetry for manual QA only

## 3. Validation refreshed on April 6, 2026

Automated validation rerun on the current tree:

- `npx tsc --noEmit`: passed
- `npm run lint`: passed
- `npm run smoke:sim`: passed
- GitHub validation workflow still matches the local gate:
  - `.github/workflows/validate.yml` runs `npm run lint`, `npx tsc --noEmit`, and `npm run smoke:sim`

Focused Android live verification completed on emulator against the current source:

- title screen loaded correctly
- `Start New Dive` entered setup correctly
- companion-select completed successfully
- run-map route selection and route entry completed successfully
- battle completed successfully
- reward screen loaded successfully after combat
- cold relaunch returned to a valid reward-resume state
- reward claim completed successfully after resume
- run-map remained healthy after reward claim
- abandon flow archived successfully into end-run

This is the current highest-confidence live loop pass for the repo.

## 4. Current release artifact status

- The canonical local release output for this pass is:
  - `android/app/build/outputs/apk/release/app-release.apk`
- A dated tester-share copy was produced in:
  - `release/dungeon-dive-bad-decisions-android-tester-2026-04-06.apk`
- The local tester artifact is for distribution/testing convenience and should not be treated as a repo-tracked source file.
- If a tester already has an older locally signed or differently signed build, they may need to uninstall it before installing the current APK.

## 5. What remains before upload

The highest-value remaining work is still human validation and store completion, not new systems:

1. Run 3 to 5 outside Android testers on the April 6 tester APK.
2. Capture whether they can explain:
   - what kind of game this is
   - what their first meaningful choice was
   - what killed them
   - whether they wanted another run
   - whether the ticket framing improves the sense of escalation continuity
   - whether the route, reward, Codex, and recap screens now feel clearer on first read
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

- `PROJECT_HANDOFF_2026-04-06.md`
- `PROJECT_HANDOFF_2026-04-06.docx`
- `DUNGEON_DIVE_APP_NEEDS_2026-04-06.docx`
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
- April 5 remains the prior release-readiness snapshot
- April 6 is now the freshest tester-build, ticket-flavor, live-validation, and GitHub-readiness snapshot
