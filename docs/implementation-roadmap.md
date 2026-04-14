# Implementation Roadmap

Version date: April 14, 2026

This roadmap translates the governing spec and the rebuild packet into practical execution work.

The source of truth above this document is still `C:/ddbd/dungeon_crawler_mobile_design_spec_codex.md`.

## Goal

Rebuild the product into a mobile-first action roguelite using the old game as a resource library, while preserving the clean foundations that still support the new design.

## Working model

- Keep infrastructure where it still serves the spec.
- Rebuild player-facing gameplay where the current implementation diverges from the spec.
- Prove one strong vertical slice before broadening content, pricing confidence, or launch plans.

## Milestone 1: Lock the reboot contract

Deliverables:

- `docs/restart-plan.md`
- `docs/vertical-slice-contract.md`
- `docs/rebuild-order.md`
- `docs/implementation-roadmap.md`
- `docs/art-production-plan.md`
- `docs/audio-production-plan.md`

Done when:

- the spec is clearly treated as non-negotiable
- the repo describes the old game as resource material, not the target product
- the rebuild sequence is explicit enough to execute without guesswork

## Milestone 2: Rebuild the first-session shell

Status on April 14, 2026: complete

Focus:

- `app/index.tsx`
- `app/onboarding.tsx`
- `app/class-select.tsx`
- `app/companion-select.tsx`

Output:

- a fast, clear opening screen
- visible accessibility entry points immediately
- a short live onboarding sequence that teaches by doing
- a class pick and companion pick that feel desirable, not administrative

Success test:

- a new player can explain who they are, what they do, and what they are choosing before the first real fight

## Milestone 3: Rebuild combat and room feel

Status on April 14, 2026: in progress

Focus:

- `app/battle.tsx`
- `src/engine/battle/`
- `app/run-map.tsx`
- `src/engine/run/`

Output:

- one phone-readable room flow
- selected-room consequences shown where the player is deciding
- clearer battle state, turn impact, and action context
- structured turn summaries instead of relying only on prose logs
- actionable combat coaching that points at the strongest next move
- less panel-hunting once a fight is already underway
- quicker room follow-through when the path forward is already obvious
- shorter ordinary encounters so rooms resolve more decisively on mobile
- event and reward choices arrive earlier in the room flow
- room types now differentiate more clearly by pace: battle fastest, reward fastest-to-claim, event sharper risk call
- rewards and events that explain exact before/after impact on the same screen
- less developer-facing and less text-first runtime framing

Success test:

- players can tell what hurt them, what changed, and what their next best action is without hunting the screen

## Milestone 4: Rebuild rewards, events, and build identity

Focus:

- `app/reward.tsx`
- `src/engine/reward/`
- `app/event.tsx`
- `src/engine/event/`
- selective reuse of `src/content/`

Output:

- rewards with exact before/after clarity
- one or two events that feel like meaningful decisions instead of text detours
- build drafting that changes how the run actually plays

Success test:

- players can state what a reward changed immediately after choosing it

## Milestone 5: Rebuild recap and replay motivation

Focus:

- `app/end-run.tsx`
- `app/progression.tsx`
- `app/hub.tsx`
- `src/progression/next-goal.ts`

Output:

- clear run result
- clear carry-forward value
- one obvious next reason to play again now

Success test:

- players can answer `why would you run again right now?` without coaching

## Milestone 6: Validate the slice

Focus:

- `scripts/smoke-sim.cjs`
- `src/analytics/schema.ts`
- `src/analytics/client.ts`
- `src/state/uxTelemetryStore.ts`

Output:

- technical validation for the rebuilt slice
- session-level evidence about clarity, reward comprehension, and replay intent

Success test:

- the slice passes repo validation and outside players can recommend it on first contact

## Milestone 7: Expand only after proof

Expansion candidates after the slice works:

- more classes
- more companions
- more enemies
- more events
- checkpointed multi-floor campaign structure
- broader floor count or mandate tiers
- stronger post-clear mastery structure

Rule:

- do not add breadth to compensate for a weak core loop

## Current recommendation

Start with a deep redesign built on preserved infrastructure, not a full repo wipe.
