# Dungeon Dive: Bad Decisions
## Android Tester Build / GitHub Readiness Addendum

Version date: April 15, 2026  
Last refreshed: April 15, 2026 after the tester-build pass, live Android smoke test, trust-surface alignment sweep, release-ledger correction, and docs refresh.

Purpose: use this addendum as the current source of truth for the repo state after the April 15 tester-build and GitHub-readiness pass. Keep `PROJECT_HANDOFF_2026-03-24.md` as the broad product/system handoff, `PROJECT_HANDOFF_2026-04-04.md` as the authored-voice snapshot, `PROJECT_HANDOFF_2026-04-08.md` as the pre-reboot release-candidate snapshot, `PROJECT_HANDOFF_2026-04-14.md` as the reboot-transition snapshot, and this April 15 addendum as the latest tester-build / repo / validation layer.

Governing contract:

- `C:\ddbd\dungeon_crawler_mobile_design_spec_codex.md` remains the product's non-negotiable source of truth.
- Current runtime behavior still does not override that spec.
- Any major mismatch between the shipped runtime and the spec should still be treated as a real product gap, not a soft future improvement.

## 1. What changed on April 15, 2026

- The repo received a full readiness sweep focused on the current rebooted slice rather than the old release-candidate framing.
- Trust-surface alignment landed across the app and repo:
  - `app/support.tsx`
  - `app/privacy.tsx`
  - `src/utils/build-info.ts`
  - `SUPPORT.md`
  - `PRIVACY_POLICY.md`
  - `README.md`
- The in-app support and privacy routes now surface:
  - the current offline-first / local-save release stance more plainly
  - the current build details needed for outside-test bug reporting
  - the same trust language the repo markdown uses
- New release-planning docs landed and are now part of the current source-of-truth set:
  - `docs/guided-first-session-test-plan.md`
  - `docs/google-play-data-safety-draft.md`
  - `docs/low-data-launch-evidence-plan.md`
  - `docs/release-candidate-2026-04-15.md`
- A new Android tester artifact was prepared:
  - canonical output: `C:\ddbd\android\app\build\outputs\apk\release\app-release.apk`
  - dated share copy: `C:\ddbd\release\dungeon-dive-bad-decisions-android-tester-2026-04-15.apk`
- A live Android emulator sanity pass completed through:
  - title
  - new run
  - class / companion setup
  - run-map
  - first required fight
  - reward claim
  - cold relaunch resume
  - run exit / abandon confirm
  - archived run recap
  - cold relaunch with the active save cleared
- No new gameplay systems or scope-expanding features were added in this pass.
- No reproducible blocker was found during the live pass, so no code fix was required before keeping the April 15 tester artifact.

## 2. What is accurate about the app right now

- The project is still in a controlled partial restart, not release-candidate hardening mode.
- The current live loop is still:
  - title
  - rebuilt onboarding / orientation
  - class-select
  - companion-select
  - run-map route choice
  - battle / reward / event
  - archive recap
  - progression / hub / codex / bonds
- The current rebooted slice is now proven locally through the first session and immediate follow-through:
  - the first required fight resolves cleanly
  - reward claim advances the run
  - cold relaunch preserves the active dive and surfaces a real resume CTA
  - resume returns to the correct live run state
  - the run-map `Run Exit` panel exposes a real abandon flow
  - abandon moves cleanly to the archived end-run summary
  - the active save slot clears after the archived run is recorded
- The title screen now gives clearer saved-run context than earlier builds:
  - floor
  - class
  - companion
  - next stop
  - last-saved recency
- The run-map route presentation remains stronger than the old release-candidate shell:
  - immediate route consequence framing
  - floor-handoff paneling
  - required fight still cannot be bypassed by clearing only side rooms
- Battle readability remains materially improved versus the old runtime:
  - exact HP deltas
  - latest-beat summary
  - next-move recommendation
  - enemy-intent paneling
  - dev-only deeper reads hidden behind secondary disclosure
- Reward flow now resolves quickly enough for outside smoke testing:
  - reward identity is clear
  - immediate package claim is visible
  - before/after payout framing is on the same screen
- The app remains offline-first in public gameplay terms:
  - no account requirement
  - no cloud sync
  - no normal-play telemetry intentionally sent to Moonlithe-operated services by default
- The dev-only `Smoke Lab` path still exists, but it remains:
  - native-dev only
  - outside the normal public gameplay loop
  - the only place where local telemetry counters or optional remote analytics validation are exposed
- The current repo should still be judged against the vertical-slice contract rather than against the old feature-freeze / release-candidate bar.

## 3. Validation refreshed on April 15, 2026

Automated validation rerun on the current tree:

- `npx tsc --noEmit`: passed
- `npm run audit:classes`: passed
- `npm run lint`: passed
- `npm run smoke:sim`: passed

Live Android validation completed on emulator:

- install of `app-release.apk`: passed
- title -> new run flow: passed
- class / companion setup: passed
- Floor 1 run-map -> required fight: passed
- reward claim -> Floor 2 handoff: passed
- cold relaunch -> resume CTA -> resumed run: passed
- `Abandon Dive` -> `Confirm Abandon` -> archived recap: passed
- cold relaunch after archive -> no active dive: passed

Notes:

- The live pass did not expose a reproducible blocker in the tested slice.
- The required GitHub validation workflow still matches the local gate:
  - `.github/workflows/validate.yml` runs `npm run lint`, `npx tsc --noEmit`, `npm run audit:classes`, and `npm run smoke:sim`

## 4. Current release artifact status

- Canonical local Android release output:
  - `C:\ddbd\android\app\build\outputs\apk\release\app-release.apk`
- Current dated tester-share copy:
  - `C:\ddbd\release\dungeon-dive-bad-decisions-android-tester-2026-04-15.apk`
- Artifact fingerprint:
  - SHA-256 `5475AD83D49C610AE83688197FD50EC7D2D48DF0FF64FAB47C0F796428B2C4B5`
- Current artifact ledger:
  - `docs/release-candidate-2026-04-15.md`

Important provenance note:

- The April 15 APK was built from the April 15 working tree based on `53106e612ce3cfbb90de0555552f158f59fdebf3`, not from a perfectly clean committed snapshot.
- The working tree already contained the support/privacy/build-info trust-surface changes that match the runtime testers will see.
- For broader external distribution that needs strict commit-to-artifact traceability, rebuild from the final merged commit after this readiness pass lands.

## 5. What remains before upload

The highest-value remaining work is still evidence gathering and vertical-slice judgment, not scope growth.

1. Run the guided first-session test wave on real Android phones using:
   - `C:\ddbd\release\dungeon-dive-bad-decisions-android-tester-2026-04-15.apk`
   - `C:\ddbd\docs\guided-first-session-test-plan.md`
2. Capture only the evidence needed to decide:
   - what kind of game testers think this is
   - what they believed their first meaningful choice was
   - whether the first fight was readable without coaching
   - whether reward / event consequence was understood
   - whether they wanted another run
   - whether `US$3.99` feels honest
3. If testers show confusion but interest, fix onboarding / clarity inside the reboot slice before expanding scope.
4. If testers show interest but weak price confidence, revisit monetization / positioning instead of forcing premium.
5. If testers understand the loop but still do not find it compelling, consider a deeper redesign or restart.
6. Finalize the public support inbox, any hosted support/privacy URLs if needed, Play listing assets, screenshots, feature graphic, and Data safety answers.
7. Rebuild the tester APK only after:
   - runtime source changes land, or
   - a blocker fix invalidates the current artifact
8. Fix only blocker bugs or compliance issues found during outside testing or store prep.

## 6. Repo guidance after this pass

- Do not commit local tester APKs, emulator dumps, or scratch smoke artifacts.
- Keep gameplay logic out of UI where possible.
- Keep archive-backed recap behavior.
- Keep content IDs kebab-case.
- Keep `scripts/smoke-sim.cjs` aligned with system changes.
- Keep `scripts/audit-class-support.cjs` aligned with the real class-extension requirements so post-launch additions fail loudly when support surfaces are missing.
- Keep `src/state/uxTelemetryStore.ts` local-only unless the privacy model is intentionally expanded later.
- Keep the remote analytics adapter vendor-neutral until a real backend decision is made.
- Keep only one root `APP_NEEDS` `.docx`, and refresh it whenever the dated source-of-truth date advances.
- Keep scope discipline intact: do reboot-slice work on purpose and avoid side-feature drift until outside testing or store prep reveals a real blocker.

## 7. Source of truth after this pass

Current canonical docs:

- `dungeon_crawler_mobile_design_spec_codex.md`
- `PROJECT_HANDOFF_2026-04-15.md`
- `PROJECT_HANDOFF_2026-04-15.docx`
- `DUNGEON_DIVE_APP_NEEDS_2026-04-15.docx`
- `docs/current-app-needs-source.md`
- `docs/release-candidate-2026-04-15.md`
- `docs/guided-first-session-test-plan.md`
- `docs/google-play-data-safety-draft.md`
- `docs/low-data-launch-evidence-plan.md`
- `docs/launch-postlaunch-retention-plan.md`
- `docs/restart-plan.md`
- `docs/vertical-slice-contract.md`
- `docs/rebuild-order.md`
- `docs/implementation-roadmap.md`
- `docs/art-production-plan.md`
- `docs/audio-production-plan.md`
- `Build_a_Viable_Expo_App.md`
- `README.md`
- `SUPPORT.md`
- `PRIVACY_POLICY.md`
- `docs/class-extension-checklist.md`
- `docs/design-spec-audit.md`
- `.github/BRANCH_PROTECTION.md`

Historical background only when needed:

- `PROJECT_HANDOFF_2026-04-14.md`
- `PROJECT_HANDOFF_2026-04-08.md`
- `PROJECT_HANDOFF_2026-04-07.md`
- `PROJECT_HANDOFF_2026-04-04.md`
- `PROJECT_HANDOFF_2026-03-24.md`

Canonical local repo root:

- `C:\ddbd`
- use `C:\ddbd` in docs, references, and handoff notes
