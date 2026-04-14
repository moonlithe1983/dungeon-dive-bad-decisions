# Dungeon Dive: Bad Decisions

Offline mobile roguelite where a burned-out office worker gets dragged into a procedural corporate hellscape and turns workplace skills into combat classes.

## Premise

`Crown Meridian Holdings` damaged reality through `Project Everrise`, a leadership-brained attempt to fuse every department into one executive control stack. `Meridian Spire` is the literal result. The game leans into dark comedy, workplace satire, grotesque absurdity, and companion banter while staying inside a sellable mature-but-store-safe lane.

## Governing Spec

`C:\ddbd\dungeon_crawler_mobile_design_spec_codex.md` is now the product's non-negotiable source of truth.

- Treat the spec as a governing design contract, not optional guidance.
- If the current runtime, docs, or launch plan diverge from the spec, treat that divergence as a real gap to close.
- Do not justify shipping decisions from the current implementation alone when the spec sets a higher bar.

## Current Product Shape

- Shipping platform: Android via Expo / React Native
- Format: portrait, offline, single-player
- Current state: controlled partial restart guided by the governing spec, with the legacy 10-floor turn-based runtime still serving as the live reference implementation while the new vertical slice is rebuilt in place
- Core loop: title -> live onboarding / orientation -> class select -> companion select -> route-choice run map -> battle / reward / event -> archive recap -> progression
- Opening setup: fresh profiles now get a short first-run title intro, immediate Settings & Accessibility access, then a live orientation flow and class briefing before companion selection
- Starting roster: 3 companions are available by default and each run still requires exactly 2 companion picks
- Run-map presentation: active floors now present a small progress strip plus live route choices instead of a full future-floor text dump
- Loop-facing presentation: run-map, event, reward, and end-run now use curated panel art sourced from `src/assets`, while compact stat cards have been tightened for narrow-phone readability
- Decision-path presentation: mission/context panels are progressively disclosed, route/event/reward choices now sit higher in the hierarchy, and player-facing copy avoids fake choice scaffolding
- Ticket-flavor presentation: setup, run-map, battle, reward, and end-run now thread an explicit ticket ID, subject, escalation track, and owner through the run
- Authored voice layer: early-floor lore beats, starting-trio chemistry, early event overlays, codex bios, reward build-lane cues, and defeat advice now use the April 4 narrative pack instead of lighter placeholder prose
- Defeat recap: archived losses now surface a compact "what killed you / what to try next" summary before the broader stats
- In-run reference access: Codex entry points now exist on run-map, battle, event, and reward, and the Codex can return directly to the active run screen
- Combat readability: live battle status labels now use readable durations/summaries, repeated crew chatter is rotated or hidden behind tactical detail, and each action now snaps the view back to the HP / threat read above the action list
- Resume clarity: title-screen resume labels now reflect the actual saved scene, such as reward, battle, event, or route selection, instead of only a generic dive label
- Persistence: SQLite with active slot, backup slot, archive history, and archive-backed recap/progression screens
- Run structure: the current legacy runtime still uses one 10-floor case file across 3 biomes with bosses on floors 4, 7, and 10; this is the present implementation, not proof that the public launch scope or final reboot structure is sufficient
- Story framing: role-fantasy and stake language now feed the assigned-role fallback, run map, battle intros, and event class reads
- Accessibility foundation: persisted theme presets, text-size controls, contrast/motion toggles, dyslexia-friendly spacing, and screen-reader hints are now in the live settings route
- Input accessibility: battle now supports a profile-backed action order, dominant-hand bias, and controller-style hint badges
- Combat shape: battle is still turn-based, but now includes a real dodge/tempo action instead of only attack-or-heal choices
- Dev QA route: native-only `dev-smoke` path for seeded final-boss win/loss validation, local UX telemetry readouts, and vendor-neutral remote analytics validation
- Policy/support surfaces: repository markdown and the in-app `support` / `privacy` routes now reflect the current offline-only, local-save, no-account shipping model

## MVP Content Snapshot

- Classes: 5
- Companions: 5
- Enemies: 18 total
- Enemy split: 10 normal, 5 miniboss, 3 boss
- Items: 10
- Statuses: 5
- Events: 10
- Bond scenes: 10

## Tech Stack

- Expo SDK 54
- React 19
- React Native 0.81.5
- Expo Router
- TypeScript
- Zustand
- `expo-sqlite`

## Live Routes

The active stack is defined in `app/_layout.tsx` and currently includes:

- `index`
- `onboarding`
- `class-select`
- `companion-select`
- `run-map`
- `battle`
- `reward`
- `event`
- `end-run`
- `progression`
- `hub`
- `bonds`
- `codex`
- `settings`
- `support`
- `privacy`
- `dev-smoke`

`dev-smoke` is intentionally native-only and only available in dev builds.

## Local Development

Install dependencies:

```bash
npm install
```

Useful commands:

```bash
npm run android
npm run web
npm run audit:classes
npm run lint
npm run smoke:sim
npx tsc --noEmit
```

Notes:

- `npm run android` uses the native Android run flow (`expo run:android`).
- Native iOS is intentionally out of scope for this project now.
- `npm run audit:classes` is the post-launch guardrail for new playable-class additions.
- `npm run smoke:sim` is the fastest automated gameplay guardrail.
- `app/settings.tsx` is now the live accessibility and theme control surface, including a visible preview for readability/contrast changes.
- `app/dev-smoke.tsx` is the quickest place to sanity-check local UX telemetry counters and the remote analytics validation surface during manual QA.

## Native Android Release Build

Once the Android native project exists, a local release APK can be produced with:

```powershell
cd android
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME='C:\Users\moonl\AppData\Local\Android\Sdk'
$env:ANDROID_SDK_ROOT=$env:ANDROID_HOME
.\gradlew.bat assembleRelease
```

Expected output:

- `android/app/build/outputs/apk/release/app-release.apk`

Important notes:

- a locally built release artifact currently exists at `android/app/build/outputs/apk/release/app-release.apk`
- the current dated outside-tester share copy is `release/dungeon-dive-bad-decisions-android-tester-2026-04-08.apk`
- the Expo launcher now resolves the real workspace path before invoking Expo, so the current checked-out repo is the source you should rebuild from
- before handing builds to testers or the store, rebuild the release APK from the final accepted source in the current repo checkout so the artifact is known current

## Save Model

SQLite is the source of truth.

- Active run slot: `primary`
- Backup slot: `autosave`
- Archive table: `run_history`
- Recaps and progression read from persisted archive payloads, not transient runtime state

This is a deliberate product constraint. Do not add a second save path unless there is a strong reason.

## Important Project Rules

- Keep combat, reward, event, progression, bond, and save logic out of UI components where possible.
- Keep content IDs kebab-case.
- Keep archive-backed recap behavior.
- Keep `scripts/smoke-sim.cjs` aligned with system changes.
- Treat `dungeon_crawler_mobile_design_spec_codex.md` as a binding product contract unless a newer explicit owner decision replaces part of it.
- Treat the handoff document as the current source of truth for release planning.
- Treat pacing, long-tail retention, and pricing fit as release blockers; use `docs/launch-postlaunch-retention-plan.md` as the retention source of truth before locking the launch business model.

## Content Status Legend

Use these labels in repo docs when talking about authored content packs:

- `Live now`: actively represented in current runtime surfaces
- `Integrated but gated`: partially surfaced, semantically aligned, or ready but not fully visible one-to-one
- `Authored reserve`: useful source material that is not part of the active runtime loop yet

## Recommended Validation

Automated:

```bash
npx tsc --noEmit
npm run audit:classes
npm run lint
npm run smoke:sim
```

Manual:

- Use `dev-smoke` in native dev builds to validate final-boss win/loss archive flows.
- Validate the full first-session shell and current end-to-end slice on device before broader testing; if you cut a build from the legacy 10-floor runtime, also validate at least one full 10-floor run.
- Confirm title, new-run setup, run map, reward/event resolution, archive recap, and resume behavior on target devices.
- Run guided first-session tests with outside players and confirm they understand the hook, complete the opening path, and can name a next goal without coaching.
- Confirm support/privacy/store materials, permissions, and launch screenshots all match the real shipped build.
- Confirm the release measurement plan is explicit: either verified production analytics/crash reporting or a deliberate low-data launch approach backed by strong manual evidence.

## Repo Guide

Important folders:

- `app/` route screens
- `src/content/` authored classes, enemies, items, events, synergies, and scenes
- `src/engine/` battle, run, reward, event, bond, meta, and dev-smoke logic
- `src/save/` SQLite bootstrap, migrations, and repositories
- `src/state/` Zustand stores and hydrated run helpers
- `android/` generated native Android project

Canonical local repo root:

- `C:\ddbd`
- use `C:\ddbd` in docs, tooling notes, handoffs, and file references

## Release Status

The repo is in a controlled partial restart:

- `dungeon_crawler_mobile_design_spec_codex.md` is the governing product contract
- the live codebase still contains the legacy 10-floor turn-based runtime, but that runtime is now the reference implementation being rebuilt in place rather than the accepted final product shape
- current runtime divergences from the governing spec are product gaps to close, not soft wishlist items
- scope discipline matters more than feature-freeze language now: keep work focused on the rebooted vertical slice, first-session clarity, room feel, reward/event readability, recap motivation, and release-trust surfaces
- pacing, long-tail retention, post-first-win motivation, and overall engagement still need to be proven before any premium launch at `US$3.99`
- the current single 10-floor case-file runtime should still be treated as insufficient for public launch by default; either the final product must expand beyond that scope or outside testing must prove the smaller structure feels unusually compelling, novel, and replayable
- fresh-profile onboarding now starts with a one-time title intro, immediate Settings & Accessibility access, a live orientation flow, then class and crew setup
- the opening roster now shows 3 companions so the first team pick is a real choice
- run-map, battle, reward, and event screens now prioritize the immediate player decision and keep more choice consequences on the same screen
- battle now surfaces structured turn outcomes, exact HP deltas, and a recommended next move instead of relying only on prose logs
- rewards and events now show clearer before/after impact on the same screen, and required fights can no longer be bypassed by clearing only side rooms
- the live settings route persists the actual accessibility/theme/input preferences the app uses, including a visual preview
- the in-app support/privacy routes and repo markdown still agree on the offline-only/local-save public model, while `dev-smoke` remains the explicit QA surface for local telemetry and remote analytics validation
- the GitHub `main` ruleset and `validate` workflow remain the required CI gate
- before future tester or store distribution, rebuild from the final accepted source in the current repo checkout and re-verify install behavior on device

## Launch Defaults

- Android only
- Google Play only
- English-speaking regions first: United States, United Kingdom, Canada, Australia, New Zealand, and Ireland
- public developer name: `Moonlithe`
- working launch price target remains `US$3.99` only if the retention and pacing bar in `docs/launch-postlaunch-retention-plan.md` is met; otherwise revisit a free route with optional paid upgrades, future games, or extras
- public support inbox still needs final owner confirmation before store setup

## Support And Privacy Drafts

- `PRIVACY_POLICY.md`
- `SUPPORT.md`

## GitHub Automation

- `.github/workflows/validate.yml` runs `npm run lint`, `npx tsc --noEmit`, and `npm run smoke:sim` on pushes to `main` and on pull requests
- `.github/workflows/validate.yml` also runs `npm run audit:classes` so new post-launch classes cannot miss required support surfaces silently
- the repo's `main` ruleset should continue requiring the `validate` check before merges into `main`
- use `.github/BRANCH_PROTECTION.md` to audit or recreate the current GitHub ruleset configuration

## License

- this repository is source-available and all rights reserved
- see `LICENSE.md`

For the current ship checklist and app-store readiness gate, use the latest handoff docs:

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
- `PROJECT_HANDOFF_2026-04-08.md`
- `PROJECT_HANDOFF_2026-04-08.docx`
- `PROJECT_HANDOFF_2026-04-07.md`
- `PROJECT_HANDOFF_2026-04-07.docx`
- `PROJECT_HANDOFF_2026-04-06.md`
- `PROJECT_HANDOFF_2026-04-06.docx`
- `SUPPORT.md`
- `PRIVACY_POLICY.md`
- `PROJECT_HANDOFF_2026-04-04.md`
- `PROJECT_HANDOFF_2026-04-02.md`
- `PROJECT_HANDOFF_2026-03-31.md`
- `PROJECT_HANDOFF_2026-03-30.md`
- `PROJECT_HANDOFF_2026-03-27.md`
- `PROJECT_HANDOFF_2026-03-24.md`
