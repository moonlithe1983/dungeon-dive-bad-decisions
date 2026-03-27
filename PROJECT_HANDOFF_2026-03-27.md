# Dungeon Dive: Bad Decisions
# GitHub Readiness Addendum

Version date: March 27, 2026
Last refreshed: March 27, 2026 after the GitHub repo hookup, README release-status alignment pass, and a fresh automated validation rerun.

Purpose: This is a short addendum to the full March 24 handoff. Use this file when you need the current repo-readiness snapshot for GitHub, documentation alignment, and the latest automated-check status. Use `PROJECT_HANDOFF_2026-03-24.md` for the full product/system handoff.

## 1. What changed on March 27, 2026

- The local folder is now a real Git repository and is connected to:
  - `https://github.com/moonlithe1983/dungeon-dive-bad-decisions`
- The initial project import commit was created and pushed to `origin/main`.
- `.gitignore` was already corrected during the GitHub hookup so the native `android/` source project stays versioned while local-only items stay excluded.
- The README release section was updated so it matches the current known release state more accurately.
- No gameplay or engine code change was required during this pass because the fresh validation rerun did not expose a reproducible defect.

## 2. What was freshly re-validated on March 27, 2026

Fresh automated checks performed during this pass:

- `npx tsc --noEmit`: passed
- `npm run lint`: passed
- `npm run smoke:sim`: passed

Fresh `smoke:sim` sample output from March 27, 2026:

- victorious run ID:
  - `run-1774616304860-zw35gzka`
- completed run status:
  - `completed`
- rewards claimed:
  - `13`
- meta currency at end of the scripted victory path:
  - `83`
- purchased class in the scripted path:
  - `customer-service-rep`
- purchased companion in the scripted path:
  - `security-skeleton`
- final hero HP:
  - `40 / 40`
- defeat branch status:
  - `failed`
- traversed nodes:
  - `20`

Important validation note:

- The exact unlocked item/event list in `smoke:sim` can still vary as content selection changes.
- The durable pass/fail gate is still the acceptance logic inside `scripts/smoke-sim.cjs`, not any single sample reward list.

## 3. What is now accurate about the repo state

Current repo-readiness truth:

- The repo is now safe to use as the GitHub source of truth for the project.
- The committed source includes the native Android project.
- Local build folders, emulator artifacts, local logs, local editor folders, `node_modules`, and Android signing material remain excluded from version control.
- The repo docs now point to the latest handoff set instead of the stale March 23 handoff.

## 4. What did not change during this pass

This pass did not newly prove any of the following:

- a full 10-floor Android release-build manual playthrough
- a fresh successful Windows release rebuild after the March 24 reward-diagnostic patch
- store metadata completion
- external playtest completion
- audio-system wiring for the saved audio toggles

Those remain open exactly as described in `PROJECT_HANDOFF_2026-03-24.md`.

## 5. Current best read after this pass

Current project status in one paragraph:

The repo is now GitHub-ready, the docs are better aligned with the actual current release situation, and the core automated gates still pass as of March 27, 2026. No new code defect was uncovered during this pass. The project still remains in release-candidate hardening mode rather than feature-development mode. The most important remaining work is still one full Android release-build manual validation run, resolving or working around the Windows long-path rebuild blocker if a fresh signed artifact is needed from this machine, removing or disabling misleading audio UI unless it becomes fully wired, and finishing store-prep work under the existing no-new-scope rule.

## 6. Source of truth after this pass

Use these docs together:

- `PROJECT_HANDOFF_2026-03-27.md`
- `PROJECT_HANDOFF_2026-03-24.md`
- `README.md`

Simple rule:

- use the March 24 handoff for the full game/product/system picture
- use this March 27 addendum for the latest GitHub/readiness/validation update
