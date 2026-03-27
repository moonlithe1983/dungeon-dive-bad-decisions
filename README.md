# Dungeon Dive: Bad Decisions

Premium mobile roguelite where a burned-out office worker gets dragged into a procedural corporate hellscape and turns workplace skills into combat classes.

## Premise

Bad Decisions Holdings damaged reality through a long chain of leadership mistakes, and the dungeon is the literal result. The game leans into dark comedy, workplace satire, grotesque absurdity, and companion banter while staying inside a sellable Mature 17+ lane.

## Current Product Shape

- Shipping platform: Android via Expo / React Native
- Format: portrait, offline, single-player
- Core loop: title -> class select -> companion select -> run map -> battle / reward / event -> archive recap -> progression
- Persistence: SQLite with active slot, backup slot, archive history, and archive-backed recap/progression screens
- Run structure: 10 floors, 3 biomes, bosses on floors 4, 7, and 10
- Dev QA route: native-only `dev-smoke` path for seeded final-boss win/loss validation

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
npm run lint
npm run smoke:sim
npx tsc --noEmit
```

Notes:

- `npm run android` uses the native Android run flow (`expo run:android`).
- Native iOS is intentionally out of scope for this project now.
- `npm run smoke:sim` is the fastest automated gameplay guardrail.

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

## Recommended Validation

Automated:

```bash
npx tsc --noEmit
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

## Release Status

The game is in release-candidate hardening mode:

- feature freeze is recommended
- Android dev-smoke win/loss validation is covered
- signed Android release APK and AAB already exist locally
- a fresh Windows release rebuild after the March 24 reward-diagnostic patch is still blocked by the current long-path native build failure
- audio settings still persist flags that are not fully wired into real runtime audio control, so they should not ship in a misleading state
- Android full release-build device validation, store packaging, and external playtesting are still required before upload

For the current ship checklist and app-store readiness gate, use the latest handoff docs:

- `PROJECT_HANDOFF_2026-03-27.md`
- `PROJECT_HANDOFF_2026-03-24.md`
