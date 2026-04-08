# Dungeon Dive: Bad Decisions

Premium mobile roguelite where a burned-out office worker gets dragged into a procedural corporate hellscape and turns workplace skills into combat classes.

## Premise

`Crown Meridian Holdings` damaged reality through `Project Everrise`, a leadership-brained attempt to fuse every department into one executive control stack. `Meridian Spire` is the literal result. The game leans into dark comedy, workplace satire, grotesque absurdity, and companion banter while staying inside a sellable mature-but-store-safe lane.

## Current Product Shape

- Shipping platform: Android via Expo / React Native
- Format: portrait, offline, single-player
- Core loop: title -> interactive onboarding tutorial -> class select -> companion select -> route-choice run map -> battle / reward / event -> archive recap -> progression
- Opening setup: fresh profiles now get a short first-run title intro, then an interactive orientation sim and assigned-role class briefing before companion selection
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
- Run structure: 10 floors, 3 biomes, bosses on floors 4, 7, and 10
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
- Treat the handoff document as the current source of truth for release planning.

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
- Validate at least one full 10-floor run in release-candidate builds before store upload.
- Confirm title, new-run setup, run map, reward/event resolution, archive recap, and resume behavior on target devices.

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

The game is in release-candidate hardening mode:

- feature freeze is recommended
- fresh-profile onboarding now starts with a one-time title intro, then routes through an interactive orientation sim before the assigned-role class briefing and companion selection
- the opening roster now shows 3 companions so the first team pick is a real choice
- the run map now centers one current floor at a time with explicit route picks instead of front-loading future-floor detail
- battle and reward screens now hide deeper mechanical detail behind toggles so the first read is shorter and more phone-friendly
- battle now auto-returns focus to the HP and threat read after each action so the next decision starts from the top of the exchange again
- event screens now lead with the real choice and tuck class/crew readouts behind an explicit toggle
- setup screens now keep role and crew flavor available without forcing it ahead of the first actionable decision
- archived defeat recaps now call out the enemy, final exchange, live statuses, and a suggested next-run adjustment
- the April 4 authored-content pass now feeds:
  - floors 1 to 3 lore beats on the run map
  - starting-trio chemistry on setup, route choice, rewards, events, and danger states
  - companion/class codex entries with stronger first-seen and archive flavor
  - authored event overlays across the full current live event pool, with the first three orientation-phase sheets still acting as the clearest bespoke onboarding-phase set
  - stronger voiced defeat recommendations after losses
- Android dev-smoke win/loss validation is covered
- Android live dev-build smoke now covers resume -> event choice -> floor transition -> battle -> reward claim -> map return on emulator
- an April 2 Android visual sweep confirmed the updated title, onboarding, settings, support, privacy, and no-active-run map copy in-context on the current debug build
- an April 4 repo smoke pass confirmed the current source still passes `tsc`, `lint`, and `smoke:sim` after the authored writing integration
- an April 5 focused Android pass confirmed reward claim -> run-map -> authored event entry -> cold relaunch resume on emulator, and a fresh local release APK now installs and launches cleanly
- automated smoke validation now also covers the route-choice map structure deterministically instead of assuming a single forced floor path
- the native Android app label now matches the real product title instead of the repo slug
- the live settings route now persists the real accessibility/theme settings that the app actually uses
- the live settings route now includes a visual preview so high contrast, color assist, reduced motion, and readability changes are visibly testable
- the primary gameplay, recap, reference, and test routes now respect the saved accessibility/theme profile rather than only the shared chrome
- the in-app support/privacy routes and the repo markdown now agree on the offline-only/local-save model, while `dev-smoke` remains the explicit QA surface for telemetry and remote analytics checks
- class-specific company lore and higher-stakes job-survival framing are now wired into the main run flow
- older companion/meta writing now carries more of that sharper company-specific tone
- combat log ordering now places the rolling narrative above the action list
- companion bond growth now has visibly stronger run impact and is surfaced in companion selection
- baseline combat/reward tuning is less forgiving than the earlier release-candidate pass
- tester-facing support/privacy/settings copy no longer exposes placeholder or future-feature language
- the GitHub `main` ruleset is now active and the stable `validate` workflow remains the required CI gate
- the project owner has already completed one full manual 10-floor Android release-build playthrough on the prior candidate
- the local Android launcher now resolves the real workspace path first, so `npm run android` works from the current repo checkout without the earlier Expo root-resolution failure
- the native-only `dev-smoke` route now surfaces local UX telemetry for first-floor choice timing, route churn, repeated crew-read detection, `Run It Back` usage, and remote analytics validation state
- the April 8 pass added profile-backed combat remapping, controller-style action hints, a live dodge action in battle, and a vendor-neutral remote analytics adapter / validation surface
- the current app and markdown policy docs now agree that public gameplay remains offline-first while remote analytics validation is a dev-only, explicitly configured QA path
- the April 6 pass fixed the reward-first post-battle progression path so victories now reliably land in reward claim before run advancement
- the April 7 pass added a persistent first-run intro, clearer route-objective language, cleaner mandatory reward CTAs, plain-language defeat/status support, and finalized Play icon/feature-graphic treatment in the repo and app config
- the current live build now exposes in-run Codex access, ticket-threaded recap copy, and `Employee Portal` wording across the loop`r`n- the home screen now shows the full title image without forced cropping, and the installed Android launcher icon now uses the `ddbd logo` asset
- the April 6 emulator pass confirmed title -> new run -> run-map -> battle -> reward -> cold relaunch resume -> reward claim -> end-run
- the April 7 release-build emulator pass confirmed fresh-install title -> first-run setup -> run-map -> battle -> reward -> cold relaunch reward resume -> reward claim -> run-map -> abandon -> end-run
- before tester or store distribution after future source changes, rebuild from the final accepted source in the current repo checkout and re-verify install behavior
- the current code/docs state still needs a focused Android regression across the new route-choice run map, battle, reward, event, end-run, resume, setup compression, settings preview, and `dev-smoke` telemetry surfaces before broader playtesting and upload

## Launch Defaults

- Android only
- Google Play only
- English-speaking regions first: United States, United Kingdom, Canada, Australia, New Zealand, and Ireland
- public developer name: `Moonlithe`
- working launch price default: `US$3.99` unless external testing later clearly supports `US$4.99`
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

- `PROJECT_HANDOFF_2026-04-08.md`
- `PROJECT_HANDOFF_2026-04-08.docx`
- `DUNGEON_DIVE_APP_NEEDS_2026-04-08.docx`
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


