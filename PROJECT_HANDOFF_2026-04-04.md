# Dungeon Dive: Bad Decisions
## Authored Voice / Readiness Addendum

Version date: April 4, 2026  
Last refreshed: April 4, 2026 after the authored writing integration pass, repo smoke validation pass, and GitHub-readiness review.  
Superseded by the April 5, 2026 handoff pair and the April 5 `APP_NEEDS` docx for current release/tester-build planning.

Purpose: This addendum captures the April 4 authored-writing/content pass. For the current release/tester-build state, use `PROJECT_HANDOFF_2026-04-05.md`, `PROJECT_HANDOFF_2026-04-05.docx`, and `DUNGEON_DIVE_APP_NEEDS_2026-04-05.docx`. Keep `PROJECT_HANDOFF_2026-03-24.md` as the broad product/system handoff, `PROJECT_HANDOFF_2026-03-31.md` as the prior polish/release addendum, and `PROJECT_HANDOFF_2026-04-02.md` as the route-choice/readability snapshot immediately before this writing pass.

## 1. What changed on April 4, 2026

- A new reusable authored narrative layer was added in `src/content/authored-voice.ts`.
- The current build now uses the supplied April 4 writing pack for the most player-visible surfaces instead of lighter placeholder prose.
- Early-floor run framing is stronger:
  - floors 1 to 3 now surface locked lore beats directly on the run map
  - the run map still stays compact and choice-first rather than front-loading future-floor explanation
- Starting-trio chemistry is now visible in the actual run flow:
  - setup / companion select
  - first route-choice framing
  - suspicious reward moments
  - creepy event prompts
  - battle danger-state chatter
- Companion and class identity are stronger in the codex:
  - codex entries now include richer bodies, first-seen lines, archive flavor, and sharper role framing
- The opening companion blurbs were upgraded so the first team choice lands with more character and less generic summary text.
- The IT Support class blurb was upgraded so the assigned-role opening better matches the intended burned-out-fixer fantasy.
- The authored event overlay layer now covers the full current live event pool through the existing event system.
- The first three orientation-phase authored sheets remain the clearest bespoke early-biome signature set:
  - `Warm Badges`
  - `Applause Threshold`
  - `Career Accelerator`
- Defeat recap advice now uses stronger authored next-run guidance instead of only utilitarian recommendations.
- Repo validation was rerun after the writing pass:
  - `npx tsc --noEmit`: passed
  - `npm run lint`: passed
  - `npm run smoke:sim`: passed

## 2. What is now accurate about the game

- The opening player experience is now more commercially presentable and more tonally specific:
  - no fake class choice on fresh profiles when only IT Support is unlocked
  - three default companions make the first decision feel real
  - the app now presents the world with a more consistent game-show-absurdity + corporate-horror voice
- Writing priority is now clearer and should stay explicit in future passes:
  - writing should enter through onboarding, route choice, battle intros, reward and event choices, companion reactions, and defeat recaps
  - new lore should only be added if it sharpens one of those gameplay-facing surfaces
  - gameplay-facing reactive copy should stay more important than codex expansion or background exposition
- The main run flow is still intentionally compact and mobile-readable:
  - route choices stay current-floor only
  - battle and reward still lead with the shortest useful decision view
  - heavier system detail remains hidden behind toggles
  - authored flavor is layered into short cards/lines rather than replacing every screen with long prose
- Defeat recap is now more useful and more voiced:
  - encounter
  - enemy
  - intent
  - final exchange
  - live statuses
  - stronger next-run guidance
- Codex now does more than label content:
  - it better sells class fantasy
  - it better sells companion identity
  - it now feels closer to an in-world archive instead of a raw reference shelf

## 3. What is true about the repo right now

- The repo is still in release-candidate hardening mode, not prototype mode.
- The canonical gameplay/UI changes currently living in the working tree include:
  - assigned-role onboarding cleanup
  - three-companion opening roster normalization
  - route-choice run map
  - compact battle and reward presentation
  - archived defeat summary support
  - April 4 authored writing integration
- The stable CI guardrail is still the `validate` workflow.
- The GitHub `main` ruleset should still require:
  - pull requests
  - stale review dismissal
  - conversation resolution
  - `validate`
  - up-to-date branches before merge
  - blocked force pushes
  - restricted deletions
- The canonical short-path repo at `C:\ddbd` now contains local Android release output under `android/app/build/outputs`, including `apk/release/app-release.apk`.
- Any legacy long-path workspace copy should still be treated as unreliable for native packaging because Windows path-length failures may recur there.
- The native app label remains correct in `android/app/src/main/res/values/strings.xml`:
  - `Dungeon Dive: Bad Decisions`

## 4. Validation refreshed on April 4, 2026

Fresh automated checks performed during this pass:

- `npx tsc --noEmit`: passed
- `npm run lint`: passed
- `npm run smoke:sim`: passed

Why this matters:

- the smoke sim still passes after the authored writing integration, which means the content-layer changes did not break route progression, event flow, reward flow, unlocks, or defeat archiving

## 5. What is still open after this pass

This pass improved tone, clarity, and repo accuracy, but it did not finish the remaining release-facing work:

- focused Android gameplay regression on the current source, now including the newly authored lore/voice surfaces
- a fresh final signed build from the final accepted source in the canonical short-path workspace (`C:\ddbd`) or another trusted build environment
- final support inbox confirmation
- live support URL and privacy-policy URL for store submission
- final Google Play listing assets and copy
- small outside playtest on the current polished build
- Google Play internal or closed testing after that outside playtest prep

Content note:

- authored event overlays now cover the current live event pool
- the first three orientation-phase sheets remain the clearest early-biome authored signature set
- broader reserve material is still available for future targeted content passes where the runtime surface is ready


## 5a. Writing source bundles added on April 4

The canonical repo also contains a verified local writing bundle set under `C:\ddbd\writing`.

Status legend:

- `Live now`: actively represented in the shipped runtime surfaces today
- `Integrated but gated`: partially surfaced, represented through semantic overlays, or present in the repo as the next live-ready layer
- `Authored reserve`: useful source material, but not a current runtime dependency

Bundle status:

- `ddbd_all_content_master_pack_verified_complete_2026-04-04.json` — `Integrated but gated`
  - broad source-of-truth export spanning live, partial, and reserve content; use this as a writer-facing reference, not as proof that every section is fully runtime-visible
- `ddbd_all_content_master_pack_index_verified_complete_2026-04-04.json` — `Integrated but gated`
  - authoritative verification/index layer for the master pack; use this to resolve content-state questions before reusing older bundle metadata
- `ddbd_final_content_bundle.json` — `Authored reserve`
  - older export kept for archive/reference purposes; its verification metadata is superseded by the verified master-pack index
- `ddbd_codex_cards_with_archive_ui.json` — `Live now`
  - codex/archive-facing identity work is broadly represented in the current codex and recap surfaces
- `ddbd_reward_and_route_ui_pack.json` — `Live now`
  - route/reward-facing authored cues and readability copy now materially shape the live loop
- `ddbd_status_and_countermeasure_pack.json` — `Integrated but gated`
  - some status/countermeasure framing is represented, but the full authored pack is not surfaced one-to-one in the runtime yet
- `ddbd_enemy_and_miniboss_voice_pack.json` — `Integrated but gated`
  - encounter framing is partially live through aligned battle/header surfaces, but the named roster remains a provisional overlay rather than settled canon
- `ddbd_boss_encounter_pack.json` — `Live now`
  - boss encounter and archive-facing framing now have real runtime homes in battle and end-run surfaces
- `ddbd_ending_and_recap_pack.json` — `Live now`
  - ending accents, archive recap framing, and defeat-facing authored copy are now materially represented in the live app

Simple rule:

- import or expand `Live now` material only when it improves a current gameplay surface
- pull from `Integrated but gated` only when the target runtime surface is actually ready to carry it
- keep `Authored reserve` out of the active loop until a deliberate content pass promotes it

## 6. Best next move after this pass

The next highest-value step is now product validation, not more repo plumbing:

1. Run a focused Android regression on:
   - route-choice run map
   - battle readability
   - reward readability
   - event readability
   - end-run recap
   - resume / relaunch
   - native `dev-smoke`
2. Fix only real blocker issues found there.
3. Produce a fresh signed release build from the final accepted `C:\ddbd` source, or use another trusted environment only if that canonical workspace is unavailable.
4. Finalize support identity and public URLs.
5. Run a small outside playtest that specifically checks:
   - opening clarity
   - readability
   - restart impulse
   - whether the first ten minutes feel sticky
6. Move into Google Play internal or closed testing.

## 7. Source of truth after this pass

Use these docs together:

- `PROJECT_HANDOFF_2026-04-04.md`
- `PROJECT_HANDOFF_2026-04-04.docx`
- `PROJECT_HANDOFF_2026-04-05.md`
- `PROJECT_HANDOFF_2026-04-05.docx`
- `DUNGEON_DIVE_APP_NEEDS_2026-04-05.docx`
- `PROJECT_HANDOFF_2026-04-02.md`
- `PROJECT_HANDOFF_2026-03-31.md`
- `PROJECT_HANDOFF_2026-03-30.md`
- `PROJECT_HANDOFF_2026-03-27.md`
- `PROJECT_HANDOFF_2026-03-24.md`
- `README.md`
- `SUPPORT.md`
- `PRIVACY_POLICY.md`
- `.github/BRANCH_PROTECTION.md`
- local writing source bundles under `writing/`, especially `ddbd_all_content_master_pack_verified_complete_2026-04-04.json` and `ddbd_all_content_master_pack_index_verified_complete_2026-04-04.json`

Simple rule:

- use March 24 for the broad product/system handoff
- use March 31 for the prior polish/readiness snapshot
- use April 2 for the route-choice/readability snapshot
- use this April 4 addendum for the current authored narrative layer, GitHub-ready repo state, and latest validation status
