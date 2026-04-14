# Restart Plan

Version date: April 14, 2026

This document exists because `C:/ddbd/dungeon_crawler_mobile_design_spec_codex.md` is now the governing product contract.

The current repo contains useful foundations, but the active gameplay loop still diverges materially from the spec and from recent playtest feedback. The owner is willing to start over from scratch if necessary, but the recommended path is a controlled partial restart rather than deleting the entire repo.

## Decision

Recommended path: `partial restart`

- Keep the clean foundations that still support the spec.
- Rebuild the product-defining gameplay surfaces that are currently out of alignment.
- Treat the rebuilt first-session vertical slice as the new quality bar before expanding content.

Full restart is permitted if the rebuild path proves slower or messier than replacement, but it is not the first recommendation because the repo already contains valuable save, accessibility, theming, telemetry, and content infrastructure.

## Keep

These systems are worth preserving unless they directly block the new spec-compliant slice:

- `src/save/`
- `src/state/` profile/save hydration foundations
- `src/analytics/`
- `src/theme/`
- `app/settings.tsx`
- content catalogs in `src/content/` as source material
- assets in `src/assets/`
- scripts and validation structure such as `scripts/smoke-sim.cjs`
- repository docs, release, and build scaffolding

## Rewrite

These are the highest-priority rebuild targets because they define the player-facing experience and are most out of alignment with the spec:

- `app/onboarding.tsx`
- `app/class-select.tsx`
- `app/companion-select.tsx`
- `app/run-map.tsx`
- `app/battle.tsx`
- `app/reward.tsx`
- `app/event.tsx`
- `app/end-run.tsx`
- `src/engine/run/`
- `src/engine/battle/`
- any helper layers whose main purpose is supporting the current text-heavy turn-flow instead of the intended mobile-first action-roguelite loop

## Defer

These areas can wait until the new vertical slice proves fun, clear, and replayable:

- quarterly / live-ops content beyond the minimum contract language
- premium pricing execution details
- store-upload polish beyond compliance basics
- broad content expansion beyond the new test slice
- deep post-launch systems that depend on a solved core loop

## Product truths learned so far

These should be treated as hard lessons, not soft preferences:

- A single 10-floor case file is not enough product value by default for paid launch.
- The game is too text-heavy in its current form.
- Companion selection must answer `why choose this one over another one` immediately.
- Rewards must show exact before-and-after impact without requiring memory.
- If the player can avoid meaningful combat and still clear the product, the loop loses stakes.
- Post-win messaging must tell the player what matters next on the same screen.
- Accessibility options must be visible before or during the earliest onboarding steps.

## Rules for the rebuild

- Do not preserve a system just because it already exists.
- Do not let the current runtime overrule the governing spec.
- Do not hide required first-time information behind toggles.
- Do not ship based on the assumption that a smaller scope is enough.
- Prefer replacing confused systems over patching them repeatedly.

## Exit condition

The partial restart is successful when:

- the rebuilt first-session slice materially satisfies the spec's non-negotiable pillars
- outside players understand the loop quickly without coaching
- the first run creates a real desire to run again
- the repo is cleaner because the new slice is simpler, clearer, and more intentional than the current patched flow
