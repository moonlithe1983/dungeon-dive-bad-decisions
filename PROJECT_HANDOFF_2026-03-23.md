# Dungeon Dive: Bad Decisions
# Project Handoff and Continuation Brief

Version date: March 23, 2026
Last refreshed: March 24, 2026 after the March 23 repo audit/validation pass, the additional Android release-build battle-route smoke pass, and the Android-only scope decision.

Purpose: This file is the durable continuation brief for future sessions. If chat history is gone, this document should still be enough to understand the current product shape, the real implementation state in the repo, the important constraints, the active validation status, and the safest next steps.

Immediate pickup state at end of March 23, 2026:
- No new gameplay code was required during the latest smoke pass because no reproducible gameplay defect was found.
- Android `dev-smoke` final-boss win/loss archive validation passed in the native dev runtime.
- An Android release APK now builds locally and has been smoke-tested through title, new-run setup, run-map entry, and relaunch/resume.
- Fresh automated checks passed again on March 23, 2026.
- After the March 24 reward-diagnostic source patch, `npx tsc --noEmit` and `npm run lint` still pass.
- The remaining work is release hardening and launch prep, not new feature development.
- Reward-screen diagnostics in source are now slightly stronger: async `GameButton` failures log instead of vanishing silently, and the reward screen now surfaces `currentRunError` inline when a claim/update action fails.
- Native iOS is now intentionally out of scope. Future release planning should assume Android-only unless that decision is explicitly reversed.

March 24, 2026 validation addendum:
- Android release-build validation now also includes a clean relaunch directly into an active `battle` route using the app deep-link scheme.
- A live `Patch Notes` combat action was executed successfully in the Android release build, and the on-screen combat log updated with real results (`Patch Notes lands for 9 damage`, `Survey Revenant is placed On Hold`, retaliation reduced).
- The persisted encounter visibly advanced to Turn 2 in the Android release build after the live action.
- The same Android release-build pass then progressed cleanly from `battle` into the `reward` route for the floor-1 battle win, confirming the post-battle handoff path in release.
- Expo Go was removed from the test emulator after it repeatedly stole foreground focus from the release app; that interference was environmental, not a release-app gameplay defect.
- Proper Android release signing is now configured locally through `android/keystore.properties` and `android/keystores/upload-keystore.jks`.
- A signed Android release APK and signed Android app bundle now both build locally.
- No reproducible release-build gameplay defect was uncovered during that additional pass.
- Later on March 24, 2026, automated emulator control regressed badly:
  - after reaching the floor-1 `reward` claim screen, repeated `adb shell input` tap, swipe, back, home, and `cmd input` events stopped changing the emulator UI at all
  - the emulator was fully restarted and the signed release app was relaunched directly into `dungeondivebaddecisions://reward`, but the same control-channel problem persisted
  - because even system-level `Home` / `Back` events no longer moved the emulator, this session cannot honestly claim a completed full 10-floor Android release-build run from automation on this machine
  - current best read is that this is an emulator automation/control-channel blocker, not a newly proven gameplay regression in the release APK
- After that automation blocker was identified, a small source-side UX fix was still made:
  - `src/components/game-button.tsx` now logs rejected async handlers instead of silently discarding them
  - `app/reward.tsx` now renders the current run error inline so a failed reward claim/update will not look like a dead button to the player or tester
- Important Windows rebuild/tooling blocker discovered on March 24, 2026:
  - after the reward-diagnostic source patch, a fresh Windows `assembleRelease` rebuild began failing inside `react-native-screens` native build steps with `Filename longer than 260 characters`
  - the failing native path is rooted under `C:\ddbd\.gradle-local\...`
  - attempted workarounds in this session:
    - forcing `GRADLE_USER_HOME` to `C:\g`
    - Gradle clean + rebuild
    - rebuilding from a temporary short drive mapping (`X:\`)
  - result:
    - the normal workspace-path build still failed on the same long-path native file
    - the `X:\` short-drive attempt got past the long-path symptom but failed during Gradle settings bootstrap instead
    - existing signed artifacts remain on disk and valid for prior release proof, but they do not yet include this latest reward-diagnostic UI patch until a fresh successful rebuild happens from a shorter-path or different environment

## 1. Product premise and locked creative direction

One-sentence fantasy:
You are a burned-out office worker dragged into a procedural hellscape where corporate job skills become combat classes.

Core title logic:
The title is literal. The dungeon exists because Bad Decisions Holdings made a chain of catastrophic leadership decisions that damaged reality.

Business goal:
Premium mobile game, solo indie project, rapid MVP intended to test revenue demand.

Platform:
- Android via React Native / Expo
- portrait
- offline
- single-player

Tone:
Dark comedy, workplace satire, grotesque absurdity, punishing but addictive, with companion banter as a major differentiator.

Writing boundary:
The vibe can be intense and profane, but it should stay in the broadly sellable Mature 17+ lane and avoid drifting into Adults Only territory.

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

## 2. Current actual project status

The old "4-floor prototype" summary is no longer accurate.

Current truth in the repo:
- The live run generator now produces the full 10-floor, 3-biome MVP path.
- Boss checkpoints are wired at floors 4, 7, and 10.
- The active loop supports real battle, reward, event, archive, recap, requisition, permanent-upgrade, bond, codex, and settings flows.
- There is a dedicated `dev-smoke` route that seeds real floor-10 final-boss states for fast win/loss validation.
- SQLite remains the source of truth for profile, active run, backup run, and archive history.

Short status summary:
The project is well past scaffolding and is now close to release-candidate territory. Android release APK creation and smoke entry/resume are now proven locally, and the latest live smoke pass did not expose a reproducible gameplay bug. The highest-value remaining work is Android manual validation, release-signing/store-build prep, store-packaging work, launch positioning, and a final polish pass on clarity/commercial presentation. Do not start major new feature work unless QA exposes a real shipping blocker.

## 3. Locked MVP targets vs current authored counts

Locked MVP targets:
- playable classes: 5
- companions: 5
- normal enemies: 10
- minibosses: 5
- bosses: 3
- loot items: 10
- status effects: 5
- biomes: 3

Locked class roster:
- IT Support
- Customer Service Rep
- Sales Rep
- Intern
- Paralegal

Locked companion roster:
- Facilities Goblin
- Former Executive Assistant
- Security Skeleton
- Possessed Copier
- Disillusioned Temp

Locked biome and boss structure:
- Open-Plan Pits, boss: HR Compliance Director
- Team-Building Catacombs, boss: Chief Synergy Officer
- Executive Suite of the Damned, boss: Executive Assistant to the Abyssal CEO

Current authored counts pulled from the repo on March 23, 2026:
- Classes: 5
- Companions: 5
- Enemies: 18 total
- Enemy tier split: 10 normal, 5 miniboss, 3 boss
- Items: 10
- Statuses: 5
- Events: 10
- Bond scenes: 10 total, two per companion

Important distinction:
- The authored counts now align much more closely with the intended MVP than the old handoff suggested.
- The live run structure is no longer stuck in the first biome. All three biomes are wired into the active generator.

## 4. Current live run structure

The current live generator in `src/engine/run/generate-run-map.ts` builds:
- 10 floors
- 2 nodes per floor
- 20 total nodes per run
- 3 live biomes
- 3 boss checkpoints

Current live floor sequence:
1. Open-Plan Pits - Basement Intake
2. Open-Plan Pits - Cubicle Trenches
3. Open-Plan Pits - Breakroom Sinkhole
4. Open-Plan Pits - Compliance Annex
5. Team-Building Catacombs - Offsite Welcome Grotto
6. Team-Building Catacombs - Trust-Fall Ossuary
7. Team-Building Catacombs - Retreat Inferno
8. Executive Suite of the Damned - Reception of Teeth
9. Executive Suite of the Damned - Boardroom Maw
10. Executive Suite of the Damned - Abyssal C-Suite

Current live boss checkpoints:
- Floor 4: HR Compliance Director
- Floor 7: Chief Synergy Officer
- Floor 10: Executive Assistant to the Abyssal CEO

Important continuation note:
If a future session still talks about a 4-floor prototype or only the first biome being wired, that information is stale.

## 5. Technical stack and constraints

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
- JSON-serialized `ProfileState` and `RunState` are still used for MVP simplicity inside the SQLite payload columns

Current dependency details that matter:
- Expo SDK 54
- React 19
- React Native 0.81.5
- `expo-sqlite` pinned to `~16.0.10`
- `react-native-safe-area-context` installed and used by active routes
- `zustand` installed and live

Current native/repo details that matter:
- Expo prebuild has generated a native `android/` project.
- `package.json` now uses `expo run:android` for the native run script.
- Native iOS is intentionally out of scope and should not be treated as an open release requirement.
- Android application ID / namespace is `com.moonlithe.dungeondivebaddecisions`.
- A locally built Android release APK currently exists at `android/app/build/outputs/apk/release/app-release.apk`.

Important implementation constraints:
- Keep combat, reward, event, progression, save, bond, and run logic outside UI components.
- Keep engine code testable as pure TypeScript where possible.
- Prefer extending the existing `src/save` layer instead of inventing a second persistence path.
- Keep content IDs kebab-case.
- Keep archive-backed recap behavior. Do not regress back to recap screens that trust transient in-memory state only.
- Use `react-native-safe-area-context` for `SafeAreaView` in active routes.

Important documentation note:
- `README.md` has been rewritten and is now a useful quick-start/project overview.
- This handoff is still the more detailed release/continuation brief and should be treated as the source of truth for ship status.

## 6. Route inventory that is actually live

The live stack under `app/_layout.tsx` currently includes:
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

Important routing notes:
- The old Expo starter tab structure is not the real app shell.
- `app/(tabs)` still exists in the repo tree, but the active game flow is the stack above.
- `dev-smoke.web.tsx` exists specifically to explain that the smoke-lab save seeding is native-only.

## 7. What is implemented now

### Bootstrap, persistence, and archive foundation

Implemented:
- SQLite database bootstrap exists.
- Schema migrations exist.
- Current schema version is 7.
- Default profile seeding exists.
- One active run slot exists: `primary`.
- One backup autosave slot exists: `autosave`.
- Active-run recovery from backup exists if the primary slot is invalid.
- Run archive history exists in `run_history`.
- Archive recap payloads exist and are the source for recap/progression views.
- Bootstrap loading and active-run summaries exist.

### Title and resume behavior

Implemented:
- `app/index.tsx` is a real title screen.
- It uses bootstrap state, profile state, and active-run summary data.
- Resume behavior is scene-aware through `getRunResumeTarget()` in `src/engine/run/progress-run.ts`.
- Resume prioritizes the correct handoff route instead of dumping the player back onto a generic map.
- Floor-start deployment rotation is now part of the resume-aware run flow.

### New-run setup

Implemented:
- `class-select` reads unlocked classes from the profile.
- `companion-select` reads unlocked companions and enforces exactly two picks.
- New runs are created through the real `RunState` path.
- New runs snapshot companion bond levels and permanent meta-upgrade levels into the run.

### Live run map

Implemented:
- `app/run-map.tsx` hydrates the active run from runtime state or SQLite.
- It renders the full 10-floor run structure.
- It shows class, HP, companion loadout, run ID, current node, inventory, and floor status.
- It supports floor-start lead/reserve companion rotation when a deployment handoff is available.
- It supports return-to-title without losing the run.
- It supports explicit abandon flow that archives the run as `abandon`.

### Combat loop

Implemented:
- `app/battle.tsx` runs a real turn-based combat loop.
- Combat persists inside `RunState`.
- Hero HP persists across encounters.
- Run inventory modifies combat outcomes.
- Class-specific combat identity is live, not just flavor.
- Companion banter and support context are live.
- Team synergies and enemy countermeasures are live.

Current player action IDs:
- `patch`
- `escalate`
- `stabilize`

Current status roster:
- Burnout
- Escalated
- On Hold
- Micromanaged
- CC'd

### Class identity and item-effect depth

Implemented:
- `src/content/class-actions.ts` is the source of truth for class action copy and summaries.
- All five classes have differentiated combat behavior.
- Run items actively modify combat through `src/engine/run/run-hero.ts`.
- Permanent meta upgrades now also modify future run durability and reward economics.

### Reward flow

Implemented:
- Battle wins create real pending rewards.
- Reward nodes create real pending rewards.
- Reward rooms now present selectable haul packages.
- Reward options can carry companion-specific bonuses.
- Reward options can carry team-synergy bonuses.
- Selected reward options persist before claim.
- Claiming rewards affects both the profile and the active run.
- Rewards can add items directly into active run inventory.
- Reward healing and max-HP effects preview into the active run.

### Event flow

Implemented:
- Event nodes are real authored scenes.
- Event choices can award meta currency, heal, damage, grant items, rotate companions, and unlock event records.
- Event scenes now surface:
  - class-specific readouts
  - companion-specific readouts
  - class edge labels
  - companion edge labels
  - synergy edge labels

### Bond systems

Implemented:
- Companion support perks are live.
- Bond levels snapshot into each new run.
- Active and reserve companions matter differently.
- Bond progression is awarded when runs are archived.
- Bond levels cap at 5.
- Bond milestone scenes are authored and surfaced.
- `bonds`, `end-run`, and `progression` surface bond gains and unlocked milestones.

### Team synergies and enemy countermeasures

Implemented:
- `src/content/team-synergies.ts` defines authored class/companion party synergies.
- Those synergies can modify:
  - combat actions
  - event choices
  - reward packages
- `src/content/enemy-team-reactions.ts` defines authored enemy countermeasures against specific party synergies.
- These countermeasures can add enemy HP, damage bonuses, and starting statuses.

### Meta-side shell screens

Implemented:
- `hub` is a real breakroom hub.
- Requisitions spend meta currency on permanent class and companion unlocks.
- Permanent meta upgrades are live through `src/engine/meta/meta-upgrade-engine.ts`.
- `bonds`, `progression`, `codex`, and `settings` are all real screens.

Current permanent meta upgrades:
- Incident Insurance
- Expense Padding
- Breakroom Trauma Kit

### Dev smoke route

Implemented:
- `app/dev-smoke.tsx` seeds a real floor-10 boss fight in dev builds.
- `near-win` seeds the final boss at 1 HP so a live victory/archive can be validated quickly.
- `near-loss` seeds the hero at 1 HP so a live defeat/archive can be validated quickly.
- The route writes both active and backup saves and then opens the normal battle route.
- `app/dev-smoke.web.tsx` intentionally blocks this flow on web because it depends on native SQLite save state.

## 8. File layout that matters

### App routes under `app/`

- `_layout.tsx`
- `index.tsx`
- `class-select.tsx`
- `companion-select.tsx`
- `run-map.tsx`
- `battle.tsx`
- `reward.tsx`
- `event.tsx`
- `end-run.tsx`
- `progression.tsx`
- `hub.tsx`
- `bonds.tsx`
- `codex.tsx`
- `settings.tsx`
- `dev-smoke.tsx`
- `dev-smoke.web.tsx`

### Shared foundation under `src/`

Components:
- `components/game-button.tsx`
- `components/placeholder-route-screen.tsx`
- `components/run-node-screen.tsx`

Content:
- `content/bond-scenes.ts`
- `content/class-actions.ts`
- `content/classes.ts`
- `content/combat-banter.ts`
- `content/companions.ts`
- `content/enemies.ts`
- `content/enemy-team-reactions.ts`
- `content/event-banter.ts`
- `content/event-class-hooks.ts`
- `content/event-companion-hooks.ts`
- `content/events.ts`
- `content/items.ts`
- `content/reward-companion-hooks.ts`
- `content/statuses.ts`
- `content/team-synergies.ts`

Engine:
- `engine/battle/combat-engine.ts`
- `engine/battle/combat-statuses.ts`
- `engine/bond/bond-progression.ts`
- `engine/bond/companion-perks.ts`
- `engine/dev/dev-smoke.ts`
- `engine/event/apply-event-choice-to-profile.ts`
- `engine/event/event-engine.ts`
- `engine/meta/meta-upgrade-engine.ts`
- `engine/meta/requisition-engine.ts`
- `engine/reward/apply-pending-reward.ts`
- `engine/reward/apply-pending-reward-to-run.ts`
- `engine/reward/create-pending-reward.ts`
- `engine/run/create-initial-run.ts`
- `engine/run/generate-run-map.ts`
- `engine/run/progress-run.ts`
- `engine/run/run-hero.ts`
- `engine/run/run-summary.ts`

Save:
- `save/bootstrap.ts`
- `save/db.ts`
- `save/migrations.ts`
- `save/profileRepo.ts`
- `save/runRepo.ts`

State:
- `state/gameStore.ts`
- `state/profileStore.ts`
- `state/runStore.ts`
- `state/use-hydrated-run.ts`

Types:
- `types/combat.ts`
- `types/content.ts`
- `types/event.ts`
- `types/profile.ts`
- `types/run.ts`
- `types/save.ts`

Scripts:
- `scripts/smoke-sim.cjs`

Native / release artifacts:
- `android/`
- `android/app/build/outputs/apk/release/app-release.apk`

## 9. Important current data model details

### Profile model

`ProfileState` currently includes:
- `profileId`
- `schemaVersion`
- `metaCurrency`
- `unlockedClassIds`
- `unlockedCompanionIds`
- `unlockedItemIds`
- `unlockedEventIds`
- `bondLevels`
- `metaUpgradeLevels`
- `settings`
- `stats`
- `createdAt`
- `updatedAt`

Default seed values that matter:
- `metaCurrency = 0`
- default unlocked class:
  - `it-support`
- default unlocked companions:
  - `former-executive-assistant`
  - `facilities-goblin`
- default bond levels:
  - `former-executive-assistant = 1`
  - `facilities-goblin = 1`
- default permanent upgrade levels:
  - `incident-insurance = 0`
  - `expense-padding = 0`
  - `breakroom-trauma-kit = 0`

`ProfileState.settings` currently includes:
- `sfxEnabled`
- `musicEnabled`
- `profanityFilterEnabled`

`ProfileState.stats` currently includes:
- `totalRuns`
- `totalWins`
- `totalDeaths`
- `totalBossesKilled`

### Run model

`RunState` currently includes:
- `runId`
- `schemaVersion`
- `seed`
- `heroClassId`
- `hero`
  - `currentHp`
  - `maxHp`
- `chosenCompanionIds`
- `companionBondLevels`
- `metaUpgradeLevels`
- `activeCompanionId`
- `inventoryItemIds`
- `floorIndex`
- `currentNodeId`
- `map`
- `runStatus`
- optional `combatState`
- `pendingReward`
- `stats`
- `createdAt`
- `updatedAt`

`RunProgressStats` currently includes:
- `nodesResolved`
- `battlesWon`
- `eventsResolved`
- `rewardsClaimed`
- `metaCurrencyEarned`
- `damageTaken`
- `healingReceived`
- `collectedItemIds`

`PendingRewardOptionState` currently includes:
- `optionId`
- `label`
- `description`
- `metaCurrency`
- `runHealing`
- `itemId`
- optional `companionBonusLabel`
- optional `synergyBonusLabel`

`PendingRewardState` currently includes:
- `rewardId`
- `sourceNodeId`
- `sourceKind`
- `title`
- `description`
- `selectedOptionId`
- `options`
- `metaCurrency`
- `runHealing`
- `itemId`
- `createdAt`

`ArchivedRunRecap` currently includes:
- `activeCompanionId`
- `finalHero`
- `inventoryItemIds`
- `metaUpgradeLevels`
- `stats`
- `outcome`
- `bondGains`

Important status/result note:
- `RunState.runStatus` is still:
  - `in_progress`
  - `paused`
  - `completed`
  - `failed`
- `abandon` is still an archive result, not a live `RunStatus`.

Important ID convention:
- Keep content IDs kebab-case.
- Examples:
  - `it-support`
  - `former-executive-assistant`
  - `printer-toner-grenade`
  - `breakroom-trauma-kit`

## 10. Save and archive architecture

Database file:
- `dungeon-dive-foundation.db`

Current schema version:
- 7

Current tables:
- `app_meta`
- `profiles`
- `active_run_slots`
- `run_backup_slots`
- `run_history`

Save-slot behavior:
- active slot: `primary`
- backup slot: `autosave`

Important persistence behavior:
- Saving an active run copies the current primary slot into backup before writing the new primary payload.
- Bootstrap can recover from backup if the active slot is invalid.
- Clearing a finished or abandoned run clears both active and backup slots so stale autosaves cannot resurrect a legitimately finished run.
- Archive recap data is persisted into `run_history.summary_payload`.
- `end-run` and `progression` read archive data instead of relying on volatile runtime state.

Important durability note:
- Do not rely on a hard-coded "current local save at handoff time" section.
- The active save is machine/runtime dependent.
- For continuation and validation, the more durable tools are:
  - bootstrap + SQLite
  - `resumeActiveRunAsync()`
  - `dev-smoke`
  - `smoke:sim`

## 11. Current Zustand store responsibilities

### `gameStore`

Purpose:
- bootstrap status
- bootstrap snapshot
- active run hydrate/refresh
- backup recovery flag
- startup error handling

### `profileStore`

Purpose:
- hydrated profile in memory
- persistent profile mutations

Current helpers include:
- refresh profile
- award meta currency
- unlock class
- unlock companion
- purchase class unlock
- purchase companion unlock
- purchase meta upgrade
- unlock item
- unlock event
- set bond level
- update settings
- apply event choice profile effects
- claim pending reward into the profile

### `runStore`

Purpose:
- runtime active run
- new-run setup state
- encounter transitions
- reward selection and claim
- event resolution
- floor-start companion rotation
- archive/abandon behavior

Current helpers include:
- begin new-run setup
- set selected class
- toggle selected companions
- hydrate active run
- create and save initial run
- resolve current node
- prepare combat for current node
- perform combat action
- apply event choice
- prepare pending reward
- select pending reward option
- claim pending reward
- rotate active companion at floor start
- abandon current run
- clear current runtime state

## 12. Fresh automated validation results

Fresh commands run during this handoff refresh on March 23, 2026:
- `npx.cmd tsc --noEmit`
- `npm.cmd run lint`
- `npm.cmd run smoke:sim`

Current automated result:
- All three commands passed.
- `Smoke simulation passed.`

Fresh `smoke:sim` output from March 23, 2026:
- victorious run ID:
  - `run-1774279367371-ynxp1dpq`
- completed run status:
  - `completed`
- rewards claimed:
  - `13`
- meta currency at end of scripted victory path:
  - `93`
- purchased class in the scripted path:
  - `customer-service-rep`
- purchased companion in the scripted path:
  - `security-skeleton`
- unlocked items observed in the scripted path:
  - `suspicious-kpi-dashboard`
  - `printer-toner-grenade`
  - `motivational-katana`
  - `pto-voucher`
  - `reply-all-amulet`
  - `calendar-invite-from-hell`
  - `bottomless-breakroom-coffee`
  - `corporate-card-of-dubious-origin`
- unlocked events observed in the scripted path:
  - `fire-drill-evangelism`
  - `breakroom-whistleblower`
  - `suspicious-elevator-pitch`
  - `all-hands-mutiny`
- carried run items at end of the scripted path:
  - `suspicious-kpi-dashboard`
  - `printer-toner-grenade`
  - `motivational-katana`
  - `pto-voucher`
  - `reply-all-amulet`
  - `calendar-invite-from-hell`
  - `bottomless-breakroom-coffee`
  - `corporate-card-of-dubious-origin`
- final hero HP:
  - `42 / 42`
- defeat branch status:
  - `failed`
- traversed nodes:
  - `20`

Important automated-validation note:
- The exact unlocked items/events observed during `smoke:sim` can vary as content and run variation evolve.
- Treat the pass/fail assertions inside `scripts/smoke-sim.cjs` as the durable acceptance criteria, not any single sample loot/event list.

What the smoke script now explicitly guards:
- 10 floors exist
- 20 total nodes exist
- all three bosses are wired to floors 4, 7, and 10
- all three biomes appear in the live generator
- reward-room options exist
- event progression exists
- persistent hero HP sync exists
- run item pickup exists
- event unlocks exist
- bond gains exist
- requisition spending exists
- permanent meta upgrades exist
- dev-smoke near-win and near-loss seeds produce real victory/defeat combat outcomes

## 13. Live smoke status and artifact notes

Important status note:
- There are now two meaningful Android live-validation proofs:
  - native dev-runtime `dev-smoke` validation of the floor-10 final-boss win/loss archive path
  - release-APK validation without Expo Go in the middle through title, new-run setup, run-map entry, and relaunch/resume
- The most recent live smoke pass did not expose a reproducible gameplay/code defect, so no follow-up code patch was made from that pass.
- The open risk is now longer-path/platform-complete validation, not basic bootstrapping.

Fresh manual Android `dev-smoke` validation performed on March 23, 2026:
- Environment used:
  - Android emulator: `Medium_Phone_API_36.1`
  - Dev runtime: Expo Go / Metro dev server
- Confirmed passing flow for `near-win`:
  - title -> `Smoke Lab` -> `Seed Near Win` -> battle
  - `Patch Notes` finished the floor-10 final boss as expected
  - `end-run` loaded a victory recap from archived run data
  - `Open Run Archive` opened `progression` correctly
  - returning to title cleared the active dive as expected
  - after reopening the project, title still showed `No active dive found.`
- Confirmed passing flow for `near-loss`:
  - title -> `Smoke Lab` -> `Seed Near Loss` -> battle
  - `Escalate Ticket` produced the intended defeat
  - `end-run` loaded a defeat recap from archived run data
  - `Open Run Archive` opened `progression` correctly
  - lifetime totals updated to reflect the additional loss
- Important nuance from that session:
  - Hard-stopping Expo Go and reopening the recent project entry initially produced an Expo Go reconnect/error screen.
  - Recovery succeeded by running `adb reverse tcp:8081 tcp:8081` and reopening the app via `exp://127.0.0.1:8081`.
  - Treat that as a dev-runtime / Expo Go reconnection quirk, not as proof of a release-build gameplay bug.
- Important limitation:
  - This validation was done in a dev runtime, not a signed release build.
  - Android final-boss smoke is now much better covered.
  - Android full 10-floor release-build validation is still open.

Fresh manual Android release-candidate validation performed on March 23, 2026:
- Native Android project was generated successfully through Expo prebuild.
- Local release APK was built successfully:
  - `android/app/build/outputs/apk/release/app-release.apk`
- The release APK installed successfully on the Android emulator.
- The release APK launched successfully without Expo Go in the middle.
- Confirmed passing release-build flow:
  - splash screen -> title screen
  - title -> class select
  - class select -> companion select
  - companion select -> `Start Dive`
  - `Start Dive` -> live run map
  - relaunch -> resume into the same persisted active run
- Most recent release smoke result:
  - no reproducible gameplay/code defect was found
- Additional Android release-build validation performed on March 24, 2026:
  - force-stopped the release app and reopened it directly into the active battle route through `dungeondivebaddecisions://battle`
  - confirmed the release build hydrated the live encounter correctly (`IT Support` at `38/38` vs `Survey Revenant` at `17/17`)
  - confirmed team synergy/support context rendered in the release build (`Paperwork Expedition`, companion support cards)
  - executed a live `Patch Notes` action in the release build and observed real combat-log updates:
    - `Patch Notes lands for 9 damage.`
    - `Survey Revenant is placed On Hold.`
    - `Retaliation reduced by 1.`
    - `Survey Revenant tries to hit back, but the timing collapses into nothing.`
  - confirmed the encounter advanced to Turn 2 after the action
  - confirmed the release build routed forward into the `reward` screen after the same battle sequence
  - reached the floor-1 battle reward claim screen and verified the real payload preview:
    - `+10` meta currency
    - `37/38 -> 38/38` run recovery
    - `Suspicious KPI Dashboard` item pickup preview
  - important testing-environment note:
    - Expo Go on the emulator repeatedly reclaimed focus with an old dev-session launcher/error task until it was uninstalled from the test emulator
    - after Expo Go was removed, release-app-only validation became much more stable
  - important limitation:
    - this session materially extended the Android release-build proof, but it still did not complete a full 10-floor manual run end to end
- Important limitation:
  - This is now a strong release-build boot/setup/battle/reward proof, but it is still not yet a full 10-floor release-build manual playthrough.
  - Android still needs one deliberate full 10-floor release-build manual playthrough on a real device or a reliably controllable emulator.
- Emulator/automation nuance:
  - Broad swipe automation occasionally foregrounded Expo Go instead of the release APK.
  - Reopening the release APK returned to the same persisted state.
  - Treat this as an emulator/app-switching quirk, not as evidence of a release gameplay bug.

Artifact note:
- Several smoke logs and screenshots remain in the repo root.
- Some older log files contain stale bundler/router errors from earlier in the day and should not be treated as current truth if they conflict with the fresh command results above.

## 14. Important implementation notes to preserve

- Keep combat, reward, event, bond, run progression, and save logic out of UI components.
- Keep kebab-case IDs.
- Keep archive-backed recap behavior.
- If route logic changes, keep `getRunResumeTarget()` updated.
- If new reward or event effects are added, update both the active run and any archive/progress stats that should reflect the outcome.
- Keep `scripts/smoke-sim.cjs` current with gameplay/system changes. It is a real guardrail now.
- Use `react-native-safe-area-context` for active screens.
- Keep `README.md` and this handoff aligned when the release process or core project shape changes.

## 15. Known gaps and still-open work

The project is no longer missing foundation work. It is now in release-candidate hardening mode.

Current release blockers / finish-before-store items:
- Android still needs one deliberate full 10-floor manual verification pass in a release-candidate build.
- This Windows workspace currently has a release-rebuild blocker after the latest source patch: `react-native-screens` can fail on release builds with a 260-character native path under `.gradle-local`. If a fresh signed APK/AAB is needed from this machine, use a shorter-path workspace, CI, Android Studio/macOS host, or another environment-level workaround before assuming local rebuilds are reliable.
- Audio settings persist, but the audio systems are not yet truly wired to those flags. Before store submission, either wire those toggles correctly or remove/disable any UI that implies audio control the app does not actually honor.
- A copy/polish pass is still needed for obvious typos, rough wording, unclear buttons, and any places where the game undersells its premise.
- Store-release packaging is still outstanding: icon, screenshots, descriptions, pricing, ratings questionnaires, privacy disclosures, support email/URL, privacy-policy destination, and upload-ready signed builds.
- Small external playtesting is still needed to confirm that first-session clarity and fun survive outside the dev context.

Release/signing status update:
- Local Android release signing is now configured and no longer depends on the debug keystore.
- Local signed artifacts now exist:
  - `android/app/build/outputs/apk/release/app-release.apk`
  - `android/app/build/outputs/bundle/release/app-release.aab`
- Local signing material now exists:
  - `android/keystore.properties`
  - `android/keystores/upload-keystore.jks`
- Preserve those two signing-material files. They now control local Play-signing output for this repo.
- The generated upload certificate currently identifies as:
  - `CN=Moon L, OU=Indie, O=Moonlithe, L=London, ST=London, C=GB`
  - SHA-256: `6D:BD:F7:D6:5D:FF:62:16:27:D8:30:4B:AE:B1:DE:E6:6C:F9:89:2A:23:E4:5E:44:40:68:44:05:D2:4B:12:33`

Important product-direction recommendation:
- Do not keep expanding scope before first submission.
- Do not add new classes, new companions, or major new systems before the first store upload.
- Allow only blocker fixes, clarity polish, release-compliance changes, and very small quality-of-life improvements discovered during QA.

Post-launch opportunities, not pre-launch requirements:
- More events for replayability.
- More reward-package variety.
- More team synergies and enemy countermeasures.
- A larger permanent upgrade tree.
- Additional balancing informed by real player feedback after launch or closed testing.

Things that are already solved and should not be listed as future foundation work:
- SQLite bootstrap and migrations
- active + backup run slots
- backup recovery
- archive-backed recap loading
- scene-aware resume routing
- full 10-floor, 3-biome generator
- boss checkpoint wiring
- persistent cross-encounter HP
- run inventory carry-over
- reward claims affecting the active run
- real event choices
- bond perks
- bond progression
- bond milestone scenes
- permanent meta upgrades
- dev-smoke run seeding
- team synergies
- enemy team countermeasures

## 16. Recommended next steps

Recommended operating stance:
- Enter feature freeze now.
- From this point forward, do not treat "more content" as the default next step.
- Focus on verification, ship polish, packaging, pricing, store presence, and launch preparation.
- If QA reveals a bug, fix the bug. If QA does not reveal a blocker, do not add scope.

Safest recommended order:
1. Run one full manual 10-floor dive on a release-candidate build for Android.
   - Verify floor-start companion rotation.
   - Verify all three boss checkpoints.
   - Verify reward package selection, event resolution, archive recap, and resume after app relaunch.
2. Package the store release assets and positioning.
   - Final app name treatment.
   - Price.
   - Short description.
   - Long description.
   - Screenshots.
   - Icon / capsule art.
   - Play Store age-rating questionnaire answers.
   - Privacy disclosure answers.
   - Support email / support URL.
3. Run a small external playtest.
   - Target 3-5 players who have not watched development closely.
   - Capture confusion points, fun moments, and price resistance.
4. Upload to Google Play test tracks.
   - Fix only blocker bugs or compliance issues surfaced by those uploads or testers.
5. Submit the first polished MVP release.
   - After submission, keep a short bug-fix window open, but continue the no-new-scope rule until the first live release is stable.

## 17. Manual device QA checklist

Use this as the handoff-ready manual validation checklist before submission.

`dev-smoke` final-boss checklist on Android:
- Open `dev-smoke`.
- Seed `near-win`.
- Confirm battle opens normally.
- Use the instructed action and confirm a real win occurs.
- Confirm `end-run` shows the correct outcome and recap data.
- Confirm `progression` loads archive-backed results, not blank/transient state.
- Return to title and confirm no stale active run resurrects after a completed run.
- Relaunch the app and confirm the completed run stays completed.
- Repeat the same flow with `near-loss`.

Android status as of March 23, 2026:
- `near-win`: passed in Expo Go / Metro dev runtime.
- `near-loss`: passed in Expo Go / Metro dev runtime.
- return-to-title active-run clearing: passed.
- post-reopen title state: passed after reconnecting Expo Go through `adb reverse tcp:8081 tcp:8081` and reopening `exp://127.0.0.1:8081`.
- release APK built locally: passed.
- release APK boot to title/class select/companion select/run map: passed.
- release APK relaunch/resume into active run: passed.
- release APK relaunch into active `battle` route via deep link: passed.
- live release-build combat action (`Patch Notes`) updated the combat log and advanced the encounter turn: passed.
- release-build battle -> reward handoff: passed.
- release signing no longer depends on the debug keystore: passed locally.
- signed release AAB output exists locally: passed.
- latest live smoke pass required no gameplay/code fix.
- still pending: full 10-floor Android release-candidate dive.

Full-run checklist on Android:
- Fresh launch reaches title without bootstrap failure.
- New-run setup works from class select through companion select.
- Run map renders current floor, HP, companions, and inventory correctly.
- Floor-start companion rotation appears when expected and updates the active companion correctly.
- Rewards can be selected, persisted, and claimed without desync.
- Events apply their effects correctly and do not strand progression.
- Bosses appear on floors 4, 7, and 10.
- Return-to-title and app relaunch resume into the correct current route.
- Archive recap is correct for victory, defeat, and abandon outcomes.
- No crashes, no save corruption, no soft-locks, no unreadable UI on target devices.

Polish checklist:
- No obvious typos in title, buttons, combat copy, reward copy, event copy, or recap text.
- Settings only expose options that actually work.
- The first 10 minutes clearly communicate premise, stakes, class fantasy, and companion personality.
- The UI feels intentional rather than placeholder.

## 18. Release readiness and "ready to upload" gate

The app is ready to upload only when all of the following are true:

Product-quality gate:
- No known P0/P1 issues remain.
- No crash, save-loss, resume-routing failure, soft-lock, or broken progression path is reproducible on target devices.
- The first-session experience feels coherent, readable, and intentionally presented.

Functional gate:
- `npx.cmd tsc --noEmit` passes.
- `npm.cmd run lint` passes.
- `npm.cmd run smoke:sim` passes.
- `dev-smoke` near-win and near-loss pass on Android.
- At least one full 10-floor release-build run passes on Android.
- Offline behavior works as expected.
- Relaunch/resume behavior works as expected.

Store/compliance gate:
- Store-ready signed release builds are created successfully.
- Android no longer uses the debug keystore for `release`, and the upload artifact needed for Play submission is produced successfully locally.
- Play Console metadata is prepared.
- Screenshots, icon, descriptions, pricing, age rating, and privacy disclosures are ready.
- Any store-required legal/support links or contact details are ready.
- There is no misleading settings/UI copy for features that are not actually implemented.

Commercial gate:
- The pricing decision is locked.
- The store page clearly communicates the hook: darkly comic premium dungeon crawler where office-job skills become combat classes.
- At least 3-5 external testers can play the opening without help.
- A majority of those testers say the game is clear, memorable, and worth recommending or buying at the planned price.

Decision rule:
- If every gate above is true, the game is ready to upload.
- If any gate above is false, do not add scope. Fix only the issue blocking the gate, then re-test.

Recommended business priority after feature freeze:
- Focus on upload readiness, store presence, pricing, screenshots, trailer/short video if desired, outreach, and launch planning.
- Treat further content expansion as a post-launch lever unless pre-launch testing shows a clear commercial problem that cannot be solved through polish alone.

## 19. Short summary of where the project stands

Current project status in one paragraph:

The repo now has a real game shell, real SQLite persistence with backup recovery, archive-backed recaps, a full 10-floor three-biome run generator with all three bosses wired, persistent cross-encounter HP and inventory, differentiated class kits, active item effects, selectable reward-room packages, class/companion/synergy-reactive event and reward systems, companion bond perks and scenes, permanent operations upgrades, a real hub/progression/bonds/codex/settings layer, a native Android project, a locally built Android release APK, and a dedicated native `dev-smoke` route for fast final-boss win/loss verification. The project is no longer blocked by scaffolding. The highest-value remaining work is Android release validation, proper signing/build packaging, store materials, market-facing polish, and submission prep under a no-new-scope rule.
