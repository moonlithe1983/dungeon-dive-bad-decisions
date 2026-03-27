# Dungeon Dive: Bad Decisions
# Project Handoff and Continuation Brief

Version date: March 15, 2026

Purpose: This file is the durable handoff for future sessions. If the chat context is lost, this document should be enough to understand the product, the current technical foundation, what has already been implemented, what the important constraints are, and what should happen next.

## 1. Product premise and locked creative direction

One-sentence fantasy:
You are a burned-out office worker dragged into a procedural hellscape where corporate job skills become combat classes.

Core title logic:
The title is literal. The dungeon exists because Bad Decisions Holdings made a chain of catastrophic leadership decisions that damaged reality.

Business goal:
Premium mobile game, solo indie project, rapid MVP intended to test revenue demand.

Platform:
iOS and Android via React Native / Expo, portrait, offline, single-player.

Tone:
Dark comedy, workplace satire, grotesque absurdity, absurdly punishing but addictive, companion banter is a major differentiator.

Writing boundary:
The vibe can be intense and profane, but the content must stay broadly sellable in the Mature 17+ / 17+ lane and avoid drifting into Adults Only territory.

Key content guardrails:
- Allowed: profanity, dark comedy, adult workplace satire, stylized fantasy violence, underworld imagery, grotesque absurdity.
- Avoid: explicit sexual content, graphic gore, body horror, slurs, hate content, religion satire, politics satire, self-harm references, real-money gambling, loot-box monetization.
- Visual rule: enemy deaths and damage should read as comic, cursed, or abstract rather than graphic.
- Writing rule: profanity should support punchlines and tension, not replace them.

Core recurring joke:
Nearly every catastrophe began as something that sounded smart in a meeting.

Canonical company name:
Bad Decisions Holdings.

Representative tone lines to preserve:
- "We cut compliance to improve agility."
- "We moved safety to a self-serve wiki."
- "We replaced legal review with an AI summary."

## 2. Locked MVP scope and game structure

Locked MVP targets:
- Playable classes: 5
- Companions: 5
- Normal enemies: 10
- Minibosses: 5
- Bosses: 3
- Loot items: 10
- Status effects: 5
- Biomes: 3

Chosen MVP classes:
- IT Support: control / cleanse / disruption
- Customer Service Rep: sustain / mitigation / retaliation
- Sales Rep: burst / momentum / risk-reward
- Intern: chaos / scaling / survival comedy
- Paralegal: precision / contract traps / punish windows

Companion roster:
- Facilities Goblin
- Former Executive Assistant
- Security Skeleton
- Possessed Copier
- Disillusioned Temp

Biome and boss structure:
- Open-Plan Pits, boss: HR Compliance Director
- Team-Building Catacombs, boss: Chief Synergy Officer
- Executive Suite of the Damned, boss: Executive Assistant to the Abyssal CEO

Run structure:
- 10 floors
- Floors use one main node plus 0-2 optional micro-nodes instead of long combat chains
- Rough target: 14-20 meaningful nodes per full run
- Boss checkpoints: floors 4, 7, and 10

Combat direction:
- Turn-based
- Portrait-first
- One hero active at a time
- Companion support with two companions selected per run
- One active companion at a time, reserve can rotate at floor transitions or on knockout

MVP status effects:
- Burnout
- Escalated
- On Hold
- Micromanaged
- CC'd

Save requirement:
Save/resume is mandatory. The player must be able to stop in the middle of a run and resume later without losing meaningful progress.

## 3. High-level technical direction

Framework:
- React Native
- Expo
- TypeScript
- Expo Router

State:
- Zustand for app/runtime state

Persistence:
- SQLite via `expo-sqlite`
- SQLite is the source of truth
- JSON-serialized `ProfileState` and `RunState` are used for MVP simplicity

Architecture rule:
Keep combat and run logic outside UI components. The engine should remain testable as pure TypeScript.

Current repo dependencies relevant to this:
- `expo-router`
- `expo-sqlite`
- `zustand`
- Expo SDK 54
- React 19
- React Native 0.81

Important dependency note:
- `expo-sqlite` is now pinned to `~16.0.10`, which matches Expo SDK 54 compatibility expectations.
- `app.json` now includes the `expo-sqlite` config plugin entry.

## 4. What has actually been implemented in this repo

The repo is no longer on the default Expo starter shell. A foundation pass has already been completed.

Implemented routing and shell:
- The old Expo starter tabs and modal flow were removed from active use.
- The app now uses a game-first root stack in `app/_layout.tsx`.
- Live routes now exist for:
  - `index`
  - `class-select`
  - `companion-select`
  - `run-map`
  - `hub`
  - `progression`
  - `bonds`
  - `codex`
  - `settings`
  - `battle`
  - `reward`
  - `event`
  - `end-run`

Implemented UI state:
- `app/index.tsx` is a real title / entry screen.
- It no longer uses mock bootstrap data.
- It reads bootstrap state through the Zustand-backed save layer.
- It shows:
  - meta stats
  - whether an active run exists
  - run summary if one exists
  - backup recovery notice if the active run was restored from backup

Implemented save/bootstrap foundation:
- SQLite database initialization exists.
- Schema migrations exist.
- Default profile seeding exists.
- Active run slot exists.
- Backup run slot exists.
- Bootstrap loading exists.
- Backup recovery exists.
- Active run summary derivation exists.
- Run history table exists.

Implemented playable run-map flow:
- `app/run-map.tsx` is no longer a dead placeholder.
- It actually attempts to resume the active run through the save layer.
- It renders seeded floor and node data if a run exists.
- It exposes live route handoffs into battle, event, and reward.
- It recovers pending rewards if the app is resumed before loot is claimed.
- It shows clean missing/error states if no run exists.

Implemented first real battle and reward slice:
- `app/battle.tsx` now runs a persisted turn loop instead of a one-button stub.
- Combat state lives inside `RunState` and survives save/resume.
- The current combat loop exposes three real actions:
  - `patch`
  - `escalate`
  - `stabilize`
- Winning standard fights creates a concrete reward payload.
- `app/reward.tsx` now applies real meta currency and item unlock progression to the saved profile.
- Reward application logic also exists as a pure helper in `src/engine/reward/apply-pending-reward.ts`, which is reused by the profile store and smoke simulation.
- Losing a fight archives the run as a defeat and routes cleanly into `end-run`.

Implemented self-run smoke validation:
- `scripts/smoke-sim.cjs` exercises the real engine code without UI by simulating:
  - a full victory path
  - reward claims
  - item unlock progression
  - a defeat branch
- This smoke simulation exposed a real early-slice balance issue in boss encounters.
- `src/engine/battle/combat-engine.ts` was tuned so early boss fights remain winnable before cross-encounter persistence and real item effects exist.

Implemented native Android smoke validation:
- A real Android emulator smoke pass was completed after Android Studio, the Android SDK, `adb`, and an emulator image were installed on this machine.
- The live on-device pass verified:
  - the title screen renders correctly
  - bootstrap state renders correctly on a fresh boot
  - `Resume Dive` is disabled when no active run exists
  - `Start New Dive` routes correctly into class selection
  - selecting `IT Support` updates setup state correctly
  - `Continue to Companions` enables correctly after class selection
  - companion selection renders correctly on-device
- No gameplay code changes were required to make those screens work on Android.
- The only repo-level issue exposed by the native smoke test was an Expo dependency mismatch: `expo-sqlite` was on the wrong version for SDK 54 and was corrected.

Implemented profile persistence beyond the original foundation:
- Profile settings are now included.
- Profile stats are now included.
- Bond levels are now included.
- Item and event unlock buckets are now included.
- Old saved profile payloads are upgraded forward instead of simply resetting.

## 5. Current file layout that matters

### App routes

Under `app/`:
- `_layout.tsx`
- `index.tsx`
- `class-select.tsx`
- `companion-select.tsx`
- `run-map.tsx`
- `hub.tsx`
- `progression.tsx`
- `bonds.tsx`
- `codex.tsx`
- `settings.tsx`
- `battle.tsx`
- `reward.tsx`
- `event.tsx`
- `end-run.tsx`

Note:
There is still an `app/(tabs)` directory present as an empty leftover folder, but it is not part of the active app flow anymore.

### Shared app foundation

Under `src/`:
- `components/`
  - `game-button.tsx`
  - `placeholder-route-screen.tsx`
- `content/`
  - `classes.ts`
  - `companions.ts`
  - `enemies.ts`
  - `items.ts`
  - `statuses.ts`
- `engine/`
  - `battle/combat-engine.ts`
  - `reward/apply-pending-reward.ts`
  - `reward/create-pending-reward.ts`
  - `run/create-initial-run.ts`
- `save/`
  - `bootstrap.ts`
  - `db.ts`
  - `migrations.ts`
  - `profileRepo.ts`
  - `runRepo.ts`
- `state/`
  - `gameStore.ts`
  - `profileStore.ts`
  - `runStore.ts`
  - `use-hydrated-run.ts`
- `theme/`
  - `colors.ts`
  - `navigation.ts`
  - `spacing.ts`
  - `typography.ts`
- `types/`
  - `combat.ts`
  - `content.ts`
  - `profile.ts`
  - `run.ts`
  - `save.ts`
- `utils/`
  - `ids.ts`
  - `strings.ts`
  - `time.ts`

Under `scripts/`:
- `smoke-sim.cjs`

## 6. Important data model details

### Profile model

Current `ProfileState` includes:
- `profileId`
- `schemaVersion`
- `metaCurrency`
- `unlockedClassIds`
- `unlockedCompanionIds`
- `unlockedItemIds`
- `unlockedEventIds`
- `bondLevels`
- `settings`
- `stats`
- `createdAt`
- `updatedAt`

Current default seed values:
- `metaCurrency = 0`
- unlocked class:
  - `it-support`
- unlocked companions:
  - `former-executive-assistant`
  - `facilities-goblin`
- bond levels:
  - `former-executive-assistant = 1`
  - `facilities-goblin = 1`
- default settings:
  - SFX enabled
  - music enabled
  - profanity filter disabled
- default stats:
  - all zeroed

Important ID convention:
Current content IDs in the repo use kebab-case, for example:
- `it-support`
- `former-executive-assistant`
- `facilities-goblin`

Do not introduce snake_case IDs unless doing a deliberate migration.

### Run model

Current `RunState` is still intentionally not final, but it is no longer just a shell.
It currently includes:
- `runId`
- `schemaVersion`
- `seed`
- `heroClassId`
- `chosenCompanionIds`
- `activeCompanionId`
- `floorIndex`
- `currentNodeId`
- `map`
- `runStatus`
- optional `combatState`
- optional `pendingReward`
- `createdAt`
- `updatedAt`

This is enough for a first playable slice with map progression, combat persistence, and reward payout, but it is still not the final full run schema.

`RunNodeState` currently contains:
- `id`
- `floorNumber`
- `sequence`
- `kind`
- `label`
- `description`
- `status`

`combatState` currently contains:
- `combatId`
- `nodeId`
- `phase`
- `turnNumber`
- `heroHp`
- `heroMaxHp`
- `enemy`
- `rollCursor`
- `log`
- `lastActionId`

Combat behavior note:
- The current loop is deterministic from run/combat state and roll cursor progression.
- Available player actions are:
  - Patch Notes: safe damage
  - Escalate Ticket: higher damage with self-damage recoil
  - Stabilize Systems: healing
- Boss tuning is intentionally softer than the likely final target right now so the first playable slice can actually be completed before persistent carry-over state and richer reward modifiers are added.

`pendingReward` currently contains:
- `rewardId`
- `sourceNodeId`
- `sourceKind`
- `title`
- `description`
- `metaCurrency`
- optional `itemId`
- `createdAt`

### Save/bootstrap model

`BootstrapSnapshot` contains:
- `hasActiveRun`
- `activeRun` summary or `null`
- `metaCurrency`
- unlocked companion count
- unlocked class count

`ActiveRunSummary` currently contains:
- `runId`
- `floorIndex`
- `className`
- `activeCompanionName`
- `lastSavedAtLabel`

## 7. SQLite persistence architecture

Database file:
- `dungeon-dive-foundation.db`

Database open/setup:
- Implemented in `src/save/db.ts`
- Enables:
  - `PRAGMA journal_mode = WAL`
  - `PRAGMA foreign_keys = ON`

Current schema version:
- 2

Tables:
- `app_meta`
- `profiles`
- `active_run_slots`
- `run_backup_slots`
- `run_history`

Current save-slot behavior:
- one active run slot: `primary`
- one backup slot: `autosave`

Important run persistence behavior:
- saving an active run copies the current active slot into the backup slot before writing the new active payload
- bootstrap load attempts to restore from backup if the active run is invalid or missing but backup is valid
- backup recovery surfaces a flag to the UI

Important end-of-run behavior:
- `clearActiveRunAsync()` now clears both active and backup slots
- this is intentional so an old autosave cannot be resurrected after a legitimate win/loss/abandon

Archiving behavior:
- `clearActiveRunAsync({ archive: ... })` records the run into `run_history`
- profile stats are updated when a run is archived

## 8. Zustand stores

### `gameStore`

Purpose:
- app bootstrap status
- current bootstrap snapshot
- active run in memory
- backup recovery flag
- startup error handling

Current responsibilities:
- initialize app
- refresh bootstrap state
- hydrate state from `loadBootstrapPayloadAsync()`

### `profileStore`

Purpose:
- hold the hydrated profile in memory
- provide mutation helpers

Current helpers include:
- refresh profile
- award meta currency
- unlock class
- unlock companion
- unlock item
- unlock event
- set bond level
- update settings
- claim a pending run reward in one persisted write

### `runStore`

Purpose:
- hold the runtime run currently being played or resumed
- hold setup selections for the new-run flow
- create and hydrate runs independently of the title-screen bootstrap store

Current responsibilities:
- begin a fresh new-run setup
- store selected class
- store selected companion pair
- create the initial `RunState`
- persist the created run
- hydrate the current runtime run from the active save slot
- resolve the current node
- initialize combat for the current battle node
- apply combat turns and persist mid-fight state
- prepare reward payloads for battle wins and reward rooms
- claim pending rewards into the profile and active run
- archive and clear the active run when the final boss is resolved

## 9. The current user-facing flow

### Title screen

`app/index.tsx` currently does this:
- loads bootstrap state through `gameStore`
- shows loading / error / ready states
- shows meta counts
- shows active run summary if one exists
- shows "Resume Dive" only if an active run exists
- routes into the rest of the placeholder stack

### New-run setup flow

`app/class-select.tsx` currently does this:
- loads unlocked classes from the saved profile
- stores the selected class in `runStore`
- lets the player continue into companion selection only after choosing a class

`app/companion-select.tsx` currently does this:
- loads unlocked companions from the saved profile
- enforces choosing exactly two companions
- stores companion order in `runStore`
- creates and persists the first real `RunState`
- routes into `run-map` after the new run is saved

### Resume flow

`app/run-map.tsx` currently does this:
- hydrates runtime state through `runStore`
- uses the already-hydrated active run from `gameStore` as a fast path if available
- otherwise resumes through the save layer
- shows:
  - loading state
  - missing state
  - error state
  - active floor summary
  - full seeded floor/node cards
  - a live entry button for the current node route
  - pending reward recovery if loot is waiting to be claimed
- renders a first-pass playable floor loop instead of a read-only save summary

### Encounter flow

`app/battle.tsx` currently does this:
- hydrates the current run if needed
- initializes persisted combat state for the current battle or boss node
- presents three real player actions
- applies deterministic damage / healing rolls and enemy retaliation
- persists mid-fight combat state back into SQLite
- routes to `reward` on normal victory and `end-run` on defeat or boss completion

`app/reward.tsx` currently does this:
- hydrates the current run if needed
- prepares a pending reward payload for reward rooms
- claims battle or room rewards into the saved profile
- awards real meta currency
- unlocks a real item when available, or converts duplicates into extra scrap
- resolves reward-room nodes after claim and returns to `run-map`

`app/event.tsx` currently still does this:
- hydrates the current run if needed
- validates that the route matches the active node kind
- resolves the active node through `runStore`
- saves progress back to SQLite
- returns to `run-map`

### End-run flow

`app/end-run.tsx` currently does this:
- shows a lightweight in-memory victory or defeat recap
- confirms that the run has already been archived and cleared from the active slot
- routes safely back to the title screen

This is now the first route that consumes the gameplay-facing runtime store rather than only bootstrap state.

## 10. Commands already verified

These checks passed after the current implementation:
- `npm run smoke:sim`
- `npx tsc --noEmit`
- `npm run lint`
- `npx expo export --platform android`
- a real Android emulator smoke pass through the title screen, class selection, and companion selection

That means the repo currently passes its code-driven smoke simulation, typechecks, lints, bundles successfully for Android, and has now also been manually smoke-tested on a real Android emulator through the first setup flow.

Current smoke simulation result to expect:
- victorious run status: `completed`
- defeat branch status: `failed`
- traversed nodes: `8`
- rewards claimed: `5`
- meta currency at the end of the scripted victory path: `44`
- unlocked items in the scripted victory path:
  - `reply-all-amulet`
  - `pto-voucher`
  - `stress-ball-of-impact`
  - `bottomless-breakroom-coffee`
  - `suspicious-kpi-dashboard`

What has not been fully verified here:
- real manual save and reload with a populated run
- end-to-end long-run play across multiple encounters and claims on the emulator
- battle, reward claim, and end-run flows through a full live Android session

Android environment details that now matter:
- Android Studio and SDK tooling are now installed on this machine.
- The SDK path is:
  - `C:\Users\moonl\AppData\Local\Android\Sdk`
- The currently available emulator name used during smoke testing is:
  - `Medium_Phone_API_36.1`
- In this Codex shell, `adb` was not automatically available on `PATH`, so future sessions may need to call it via its full path:
  - `C:\Users\moonl\AppData\Local\Android\Sdk\platform-tools\adb.exe`
- The emulator binary may also need to be called via full path from this shell:
  - `C:\Users\moonl\AppData\Local\Android\Sdk\emulator\emulator.exe`

Android launch behavior note:
- `npm run android` under the default LAN-style Expo flow was not reliable from this environment because Expo Go got stuck on the loading screen while trying to talk to Metro over the LAN IP.
- The reliable launch path from this machine was:
  1. start the emulator
  2. run Expo in localhost mode on a dedicated port
  3. use `adb reverse` for that port
  4. open Expo Go against `exp://127.0.0.1:<port>`
- The working commands used in practice were:
  - `emulator -avd Medium_Phone_API_36.1`
  - `npx expo start --android --localhost -p 8082 --clear`
  - `adb reverse tcp:8082 tcp:8082`
- Once that was in place, Expo Go loaded the project manifest from `127.0.0.1:8082` and rendered the real app UI.

## 11. Important design and implementation assumptions already made

- The app uses a consistent dark presentation now. `app.json` was updated away from the default auto light/dark shell.
- `app.json` now also includes the `expo-sqlite` config plugin entry.
- The current foundation is still intentionally pre-vertical-slice, but the run-map loop is no longer a pure scaffold.
- The save layer favors validation and recovery over minimalism.
- The `RunState` is still intentionally not final, but it now includes seeded floor and node data.
- Placeholder routes are still acceptable for non-core screens, but `run-map`, `battle`, `event`, `reward`, and `end-run` now have live responsibilities.
- Combat logic is still expected to live outside UI.
- The smoke simulator is now an important guardrail for engine work and should stay green as combat, rewards, and run progression evolve.

## 12. Known gaps and what is not done yet

Not implemented yet:
- deeper map generation beyond the current first-pass seeded layout
- real event choice logic
- reward choice depth and item gameplay effects
- progression economy
- bond scenes
- settings screen wiring
- codex content browsing
- full end-run reward and summary screen

Also not implemented yet:
- a UI for run history
- abandon handling inside the live run loop
- scene-aware resume that drops directly back into battle or reward instead of the map
- persistent cross-encounter hero state such as carry-over HP or inventory

Current `run-map` status:
- it hydrates the current runtime run through `runStore`
- it renders seeded floor and node data
- it exposes a real current-node handoff into battle, event, and reward routes
- node resolution writes updated run state back into the active slot
- finishing the boss archives the run and clears the active save slot

## 13. Recommended next step

The next meaningful implementation target should be:

Make combat consequences persist across the run instead of resetting every fight.

Specifically:
- move hero survivability and inventory out of one-off combat setup and into persistent run state
- let claimed rewards affect the active run instead of only the profile
- decide how unlocked items become actual combat modifiers or pickups
- make encounters consume and update that run-wide state
- keep end-run recap grounded in archived or persisted result data

Suggested order:
1. Add run-wide hero stats to `RunState` so combat no longer starts from a full reset each encounter.
2. Let reward claims feed that run-wide state, such as healing, consumables, or passive modifiers.
3. Decide whether unlocked items are meta unlocks only or can also appear as active run rewards.
4. Upgrade `end-run` to read archived data or a persisted recap payload instead of relying on in-memory store state.
5. Keep `npm run smoke:sim` updated as the guardrail for these engine changes, especially once cross-encounter survivability and reward modifiers change the expected victory path.
6. After that, choose whether event choice depth or reward choice depth is the better next slice.

## 14. Save integration rules to preserve

Once gameplay routes exist, call `saveActiveRunAsync(runState)` after:
- node resolution
- reward selection
- event choice
- floor transition
- boss intro setup
- manual save from pause menu

Archive the run with `clearActiveRunAsync({ archive: ... })` when:
- player wins
- player dies
- player abandons the run

Do not leave backup data intact after a final run-clear unless you intentionally want abandoned recovery behavior.

## 15. Implementation notes for future sessions

- Prefer extending the current `src/save` architecture instead of introducing a second parallel save layer.
- Prefer reusing the current content IDs and naming conventions.
- Keep new code aligned with the current theme tokens in `src/theme`.
- Keep route structure flat under `app/` unless there is a strong reason to group differently later.
- If the router typed-route cache complains about missing/new routes, remember the app currently uses explicit `Href` casts in route pushes to avoid temporary typed-route drift.
- For Android testing from this machine, prefer localhost Expo sessions plus `adb reverse` over the default LAN flow if Expo Go hangs on a loading spinner.
- If the Codex shell does not recognize `adb` or `emulator`, use the full SDK paths listed in section 10.

## 16. Short summary of where the project stands right now

Current project status in one paragraph:

The repo has moved past a pure concept phase and now has a real Expo Router game shell, a dark title screen backed by SQLite bootstrap data, a validated save/resume foundation with active and backup run slots, richer profile persistence with settings/stats, run-history archiving, a dedicated `runStore`, a working new-run setup flow across class and companion selection, a seeded multi-floor `RunState`, a playable first-pass `run-map`, a real persistent battle loop with saved combat state, a concrete reward claim flow that pays meta currency and unlocks items, an end-run handoff that archives both wins and losses, a code-driven smoke simulation that exercises the full current gameplay loop, and a verified Android emulator launch path that has already rendered the real app UI through the first setup flow. The project is still not a full vertical slice yet, but it now has an actual end-to-end playable skeleton rather than only infrastructure.
