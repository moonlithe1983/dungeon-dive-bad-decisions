# Dungeon Dive: Bad Decisions
## GitHub Readiness Addendum

Version date: March 30, 2026
Last refreshed: March 30, 2026 after the class-specific company-lore pass, the duplicate pending-reward fix, the combat-log reorder, the accessibility/theme-settings foundation pass, the bond-impact rebalance, the difficulty/reward tuning pass, the smoke-sim assertion refresh, the README alignment pass, and a fresh automated validation rerun.

Purpose: This is a short addendum to the earlier handoff set. Use this file when you need the current repo-readiness snapshot for gameplay-facing changes, documentation alignment, and the latest automated-check status. Use `PROJECT_HANDOFF_2026-03-24.md` for the full product/system handoff and `PROJECT_HANDOFF_2026-03-27.md` for the GitHub hookup / policy / workflow pass.

## 1. What changed on March 30, 2026

- The game now has a stronger shared fiction layer built around `Crown Meridian Holdings`, `Project Everrise`, and `Meridian Spire`.
- Class-select, run-map, battle, and event text now speak to the player as the class they chose instead of using flatter generic office-run copy.
- The run now frames leadership as the cause of the disaster and the approval bottleneck the player has to survive, which better supports the intended dark-comedy, job-on-the-line tone.
- The duplicate `Claim Pending Reward` button on the map flow was fixed so pending rewards only render one actionable claim CTA.
- The battle combat log now renders above the action list so story and turn progression are easier to follow on device.
- A persisted accessibility/theme settings foundation now exists:
  - named theme presets
  - text-size controls
  - high-contrast toggle
  - reduced-motion toggle
  - color-assist toggle
  - dyslexia-friendly spacing toggle
  - screen-reader hint toggle
- Shared controls, navigation chrome, and the archive/reference flow now respect the saved accessibility/theme profile.
- Older route-specific palettes are not fully migrated yet, so the whole app does not visually restyle with equal depth on every screen yet.
- Companion bond growth now matters more in live numbers:
  - companion perk magnitudes were increased
  - companion-select now surfaces bond level, active perk impact, reserve perk impact, and the next support milestone
- Baseline combat and reward balance was tightened because earlier random-action play was too forgiving.
- `scripts/smoke-sim.cjs` was updated to match the new healing values and the deeper search needed for the tougher scripted victory path.
- `README.md` now matches the current story framing, accessibility/settings truth, combat-log ordering, and tuning state more closely.

## 2. What was freshly re-validated on March 30, 2026

Fresh automated checks performed during this pass:

- `npx tsc --noEmit`: passed
- `npm run lint`: passed
- `npm run smoke:sim`: passed
- `npm run smoke:sim` now uses a deterministic seeded path so CI and local reruns exercise the same authored tower instead of rolling live random seeds

Fresh `smoke:sim` sample output from March 30, 2026:

- victorious run ID:
  - `run-1774900000001-84byddd8`
- completed run status:
  - `completed`
- rewards claimed:
  - `13`
- meta currency at end of the scripted victory path:
  - `75`
- purchased class in the scripted path:
  - `customer-service-rep`
- purchased companion in the scripted path:
  - `security-skeleton`
- final hero HP:
  - `1 / 44`
- defeat branch status:
  - `failed`
- traversed nodes:
  - `20`

Important validation note:

- The victory path is intentionally tighter than before, so the scripted run now ends much closer to defeat.
- The durable pass/fail gate is still the acceptance logic inside `scripts/smoke-sim.cjs`, but the harness now locks to a deterministic seed so CI does not drift between different tower rolls.

## 3. What is now accurate about the repo state

Current repo-readiness truth:

- The repo docs now describe the current game fiction more honestly than the earlier generic-office framing.
- The README now points to this March 30 addendum as the newest readiness snapshot.
- The app now has a real persisted accessibility/settings surface instead of treating accessibility as a future-only note.
- The combat-log placement now matches the intended story-first battle read order.
- The duplicate pending-reward CTA reported during manual Android play has been fixed.
- Companion bond growth now has more visible strategic weight than it had in the earlier release-candidate pass.
- Baseline combat and reward tuning are now less forgiving than the earlier state, but the run still remains solvable by the authored smoke path.
- Shared controls and chrome already respond to saved accessibility/theme settings, and `end-run`, `progression`, and `codex` now follow the same live palette/readability system, but a full palette migration across every older route is still ongoing.

## 4. What did not fully change during this pass

This pass did not fully complete any of the following:

- a total visual-theme rollout across every older screen and panel style
- a full deep-write pass for every single companion, reward, encounter, and event line in the new sharper class-specific tone
- the full long-term progression/meta-retention system beyond stronger persistent companion bond value
- a new manual 10-floor Android release-build validation after these gameplay/story changes
- store-metadata completion or external playtest completion

Those remain open hardening work, not hidden completion.

## 5. Current best read after this pass

Current project status in one paragraph:

The repo is in a better GitHub-ready state than it was on March 27 because the docs now line up with the game the player will actually see, the reported duplicate-reward CTA defect is fixed, battle storytelling is easier to follow on mobile thanks to the combat-log reorder, the settings route now carries real accessibility/theme value instead of hand-waving, companion bonds matter more, and baseline combat is less of a random-button-mash win. The project is still in release-candidate hardening mode rather than true content lock: the accessibility rollout is foundational rather than visually complete on every older screen, the new tone and storyline need deeper propagation through the remaining authored content, and a fresh full manual Android run remains the next important product-level validation after this pass.

## 6. Source of truth after this pass

Use these docs together:

- `PROJECT_HANDOFF_2026-03-30.md`
- `PROJECT_HANDOFF_2026-03-27.md`
- `PROJECT_HANDOFF_2026-03-24.md`
- `README.md`
- `SUPPORT.md`
- `PRIVACY_POLICY.md`

Simple rule:

- use the March 24 handoff for the full game/product/system picture
- use the March 27 addendum for the GitHub hookup / policy / workflow pass
- use this March 30 addendum for the newest gameplay/docs/accessibility/readiness snapshot
