# Rebuild Order

Version date: April 14, 2026

This file translates the restart plan into a concrete execution order.

## Phase 0: protect the current repo

Keep the current implementation as a reference baseline.

- preserve the current branch or tag it as the pre-rebuild reference
- do not delete foundational save, settings, analytics, asset, or content files unless they actively block the new slice

## Phase 1: write the contract into the repo

- `dungeon_crawler_mobile_design_spec_codex.md`
- `docs/restart-plan.md`
- `docs/vertical-slice-contract.md`
- `docs/rebuild-order.md`
- `README.md`
- `docs/launch-postlaunch-retention-plan.md`
- `docs/design-spec-audit.md`
- `PROJECT_HANDOFF_2026-04-15.md`

Goal:

- make the spec the governing design contract
- make the partial-restart decision explicit
- make the quality bar visible before any more gameplay work lands

## Phase 2: rebuild the first-session shell

Primary files:

- `app/index.tsx`
- `app/onboarding.tsx`
- `app/class-select.tsx`
- `app/companion-select.tsx`

Goal:

- the game explains itself quickly
- accessibility is visible early
- the player reaches the first real playable decision with minimal friction

## Phase 3: rebuild the playable loop

Primary files:

- `app/run-map.tsx`
- `app/battle.tsx`
- `app/reward.tsx`
- `app/event.tsx`
- `src/engine/run/`
- `src/engine/battle/`
- `src/engine/reward/`
- `src/engine/event/`

Goal:

- create one fun, readable, mobile-first playable loop
- remove systems that create text load without adding excitement
- ensure fights, risk, and rewards all have visible consequences

## Phase 4: rebuild post-run motivation

Primary files:

- `app/end-run.tsx`
- `app/progression.tsx`
- `app/hub.tsx`
- `src/progression/next-goal.ts`

Goal:

- the first clear, loss, or retreat creates an immediate next goal
- the player understands why another run matters
- the game no longer ends in vague archive-only abstraction

## Phase 5: validate the new slice

Primary files:

- `scripts/smoke-sim.cjs`
- `src/analytics/schema.ts`
- `src/analytics/client.ts`
- `src/state/uxTelemetryStore.ts`

Goal:

- verify the rebuilt slice technically
- measure first-session and replay-intent signals honestly
- keep the repo clean as the new slice replaces the old assumptions

## Phase 6: only then expand

After the slice works:

- revisit total floor count and content breadth
- revisit premium pricing confidence
- revisit roadmap sequencing
- expand classes, companions, events, and floors only after the rebuilt core loop earns that expansion

## File-by-file priority summary

Priority 1:

- `app/index.tsx`
- `app/onboarding.tsx`
- `app/battle.tsx`
- `src/engine/battle/`

Priority 2:

- `app/companion-select.tsx`
- `app/run-map.tsx`
- `app/reward.tsx`
- `src/engine/run/`
- `src/engine/reward/`

Priority 3:

- `app/event.tsx`
- `app/end-run.tsx`
- `app/progression.tsx`
- `app/hub.tsx`
- `src/progression/next-goal.ts`

Priority 4:

- supporting content packs in `src/content/`
- telemetry and smoke-test refinements
- launch-material updates after the slice is proven
