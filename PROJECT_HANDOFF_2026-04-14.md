# Dungeon Dive: Bad Decisions
## GitHub Readiness / Source-of-Truth Refresh Addendum

Version date: April 14, 2026  
Last refreshed: April 14, 2026 after the GitHub-readiness sweep, doc alignment pass, binary doc regeneration, code-quality cleanup, and validation rerun.

Purpose: use this addendum as the current source of truth for the repo state after the April 14 reboot transition. Keep `PROJECT_HANDOFF_2026-03-24.md` as the broad product/system handoff, `PROJECT_HANDOFF_2026-04-04.md` as the authored-voice snapshot, `PROJECT_HANDOFF_2026-04-08.md` as the pre-reboot release-candidate snapshot, and this April 14 addendum as the latest repo/docs/validation state.

Governing contract:

- `C:\ddbd\dungeon_crawler_mobile_design_spec_codex.md` is now the product's non-negotiable source of truth.
- Current runtime behavior does not override that spec.
- Any major mismatch between the shipped runtime and the spec should now be treated as a real product gap, not a soft future improvement.

## 1. What changed on April 14, 2026

- The repo no longer treats the old release candidate as the target product.
- `dungeon_crawler_mobile_design_spec_codex.md` is now explicitly the governing product contract across the repo docs.
- Reboot packet docs landed:
  - `docs/restart-plan.md`
  - `docs/vertical-slice-contract.md`
  - `docs/rebuild-order.md`
  - `docs/implementation-roadmap.md`
  - `docs/art-production-plan.md`
  - `docs/audio-production-plan.md`
- First-session shell rebuild landed:
  - `app/index.tsx`
  - `app/onboarding.tsx`
  - `app/class-select.tsx`
  - `app/companion-select.tsx`
- Milestone 3 gameplay-surface rebuild is now underway and this pass updated:
  - `app/run-map.tsx`
  - `app/battle.tsx`
  - `app/reward.tsx`
  - `app/event.tsx`
- Combat state now carries structured per-turn summaries:
  - exact hero HP delta
  - exact enemy HP delta
  - player-side highlights
  - enemy-side highlights
  - battle UI no longer has to infer all turn meaning from prose logs alone
- Supporting balance / loop fixes already in repo remain part of the current state:
  - events and reward rooms no longer replace required fights
  - reward and event payout economy is reduced versus the old release candidate
  - rewards and battle surfaces now show more direct before/after state
- The April 8 tester APK is now historical reference, not a representation of the current repo behavior.
- The GitHub-readiness sweep also fixed small player-facing quality issues:
  - the settings action-order controls now use readable ASCII labels instead of corrupted arrow glyphs
  - the class-select locked-class copy no longer shows a corrupted separator glyph
  - the current handoff and APP_NEEDS `.docx` files were regenerated so the binary docs match the markdown source-of-truth again

## 2. What is accurate about the app right now

- The project is in a controlled partial restart, not release-candidate hardening mode.
- The current live loop is still:
  - title
  - rebuilt first-session shell
  - live onboarding / orientation
  - class-select
  - companion-select
  - run-map route choice
  - battle / reward / event
  - end-run archive recap
  - progression / hub / codex / bonds
- The first-session shell is materially more aligned with the governing contract:
  - accessibility is surfaced immediately
  - onboarding is shorter and more live than the old packet-heavy flow
  - class and companion picks are framed as desirable choices instead of administrative briefings
- The room-flow rebuild is partially landed:
  - route cards show stronger on-card consequence framing
  - battle surfaces prioritize current state, latest change, and next action more directly
  - battle action cards can now recommend the strongest next move based on current state
  - nonessential battle reads collapse once the fight is truly underway
  - single-path room follow-through is quicker on the run map
  - ordinary encounter health scaling is lower, so rooms resolve faster and feel less like long attrition paperwork
  - reward and event screens now put the decision earlier and defer more of the flavor/context load
  - reward rooms resolve faster because the claim action now sits closer to the actual choice
  - event rooms now lead with a sharper risk-call framing instead of as much up-front secondary navigation
  - reward and event options show clearer before/after impact on the same screen
  - some developer-facing or raw-internal labels have been removed from player-facing runtime text
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
- The current repo should be judged against the vertical-slice contract, not against the old release-candidate feature-freeze bar.

## 3. Validation refreshed on April 14, 2026

Automated validation rerun on the current tree:

- `npx tsc --noEmit`: passed
- `npm run audit:classes`: passed
- `npm run lint`: passed
- `npm run smoke:sim`: passed
- GitHub validation workflow still matches the local gate:
  - `.github/workflows/validate.yml` runs `npm run lint`, `npx tsc --noEmit`, `npm run audit:classes`, and `npm run smoke:sim`

Notes:

- Validation now reflects the rebooted repo state, not only the pre-reboot release candidate.
- The main April 14 outcome is that the repo, docs, and validation story are aligned around the governing spec and the controlled restart.

## 4. Current release artifact status

- The canonical local Android release output path remains:
  - `android/app/build/outputs/apk/release/app-release.apk`
- The latest dated tester-share copy already in the repo workspace remains:
  - `release/dungeon-dive-bad-decisions-android-tester-2026-04-08.apk`
- Do not treat that tester APK as representative of the current repo after the reboot work.
- Rebuild a new outside-test artifact only after the vertical slice is coherent enough to test honestly.

## 5. What remains before upload

The highest-value remaining work is now vertical-slice execution and validation against the governing spec, not release-candidate polishing of the old product shape.

Premium release gate: do not ship at `US$3.99` until the rebuilt slice is engaging, replay-worthy, and recommendation-worthy enough to justify a public launch. If that bar is not met, revisit pricing, scope, or format instead of shipping weak premium value.

Scope gate: do not assume the current single 10-floor case-file runtime is enough for public launch. Either the final game must expand beyond that scope or outside testing must prove the smaller structure feels unusually compelling, novel, and replayable.

1. Share the already-built April 8 tester APK for the next outside smoke wave unless runtime source changes again first.
2. Run guided first-session tests with outside players on real Android phones and confirm they can install, finish the opening loop, and explain why they would play again without coaching.
3. If testers show confusion but interest, fix onboarding / clarity inside the reboot slice before expanding scope.
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
- Keep scope discipline intact: do reboot-slice work on purpose and avoid side-feature drift until outside testing or store prep reveals a real blocker.

## 7. Source of truth after this pass

Current canonical docs:

- `dungeon_crawler_mobile_design_spec_codex.md`
- `PROJECT_HANDOFF_2026-04-14.md`
- `PROJECT_HANDOFF_2026-04-14.docx`
- `DUNGEON_DIVE_APP_NEEDS_2026-04-14.docx`
- `docs/current-app-needs-source.md`
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

- `PROJECT_HANDOFF_2026-04-08.md`
- `PROJECT_HANDOFF_2026-04-07.md`
- `PROJECT_HANDOFF_2026-04-04.md`
- `PROJECT_HANDOFF_2026-03-24.md`

Canonical local repo root:

- `C:\ddbd`
- use `C:\ddbd` in docs, references, and handoff notes
