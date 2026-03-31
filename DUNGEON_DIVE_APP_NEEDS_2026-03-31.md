# Dungeon Dive: Bad Decisions App Needs

Current as of March 31, 2026

## Current launch decisions

These are still the current working decisions:

- launch on Android only
- launch on Google Play only
- do not treat iOS as part of the current launch plan
- keep feature freeze in place
- do not add new classes, new companions, or big new systems before the first upload
- allow only bug fixes, wording polish, store-compliance fixes, and very small quality-of-life changes
- use paid upfront as the safest version 1 launch plan
- current working launch price: USD 3.99 unless testing later clearly supports USD 4.99
- final public support inbox still needs owner confirmation, but placeholder support-email copy should not appear in tester-facing materials
- current public Google Play developer name in project docs: `Moonlithe`
- treat accessibility as a live product requirement, not a future backlog item

## What is already true about the product

The game already has the major MVP and release-candidate systems in place:

- title screen
- class select
- companion select
- exactly 2 companion picks for a run
- run map
- battles
- rewards
- events
- end-run recap
- progression
- hub
- bonds
- codex
- settings
- support and privacy draft pages
- SQLite saving
- an active save slot
- a backup autosave slot
- archive history for completed runs
- archive-backed recap and progression data
- a full 10-floor run
- 3 biomes
- bosses on floors 4, 7, and 10
- 5 classes
- 5 companions
- 10 normal enemies
- 5 minibosses
- 3 bosses
- 10 items
- 5 statuses
- 10 events
- bond progression
- 10 bond scenes
- permanent upgrades
- team synergies
- enemy countermeasures
- a native-only `dev-smoke` route for fast win/loss testing

## What changed in the March 31 polish pass

- GitHub validation is now easier to protect:
  - `.github/workflows/validate.yml` exposes a stable required check named `validate`
  - `.github/BRANCH_PROTECTION.md` documents the exact manual GitHub rule to turn on
- Theme/accessibility parity now reaches the full main player/tester flow instead of stopping at shared chrome and a subset of routes.
- The primary routes now respond to the saved profile for theme preset, text size, contrast, motion, color assist, dyslexia spacing, and screen-reader hints.
- The settings screen no longer implies that audio/language preferences exist as live saved gameplay settings.
- README/support/privacy copy now better matches the build testers will actually use.
- The sharper `Crown Meridian Holdings` / `Project Everrise` / `Meridian Spire` tone now carries further through older meta/reference content and companion writing.

## Android release work already completed

Android release work already completed includes:

- a native Android project exists in `android/`
- local Android release artifacts already exist under `android/app/build/outputs`
- a local APK already exists
- a local AAB already exists
- release signing no longer depends on the debug keystore
- earlier release-build smoke covered title, new-run setup, run-map entry, relaunch/resume, battle entry, and battle-to-reward handoff
- a later Android dev-build smoke also covered resume -> event choice -> floor transition -> battle -> reward claim -> map return
- the project owner has confirmed one full manual 10-floor Android release-build playthrough on the prior candidate
- `dev-smoke` already exists as a fast native-only win/loss regression route

## Automated checks confirmed on the March 31 repo state

- `npx tsc --noEmit` passed
- `npm run lint` passed
- `npm run smoke:sim` passed

## Biggest current risks

The biggest remaining risks are launch and release-process risks, not missing game systems:

- GitHub branch protection still needs to be enabled manually so CI is required before merges to `main`
- the final public support inbox is still not locked
- support URL and privacy-policy URL still need to be finalized and hosted publicly before submission
- store screenshots, store copy, icon, ratings answers, privacy answers, and support links are not all finalized yet
- a small outside playtest on the newer polished build has not happened yet
- the current polished build still needs a focused Android regression pass so future testers see the newest copy/theme updates in-device
- the Windows workspace may still have a long-path native rebuild blocker when producing a fresh final artifact

## What must happen before upload

The game should be treated as ready for Google Play only when all of the following are true:

- the current polished build has been checked on Android after the March 31 copy/theme/accessibility pass
- title, new-run setup, map flow, rewards, events, bosses, archive recap, resume, and `dev-smoke` all still work on that current build
- `npx tsc --noEmit` passes
- `npm run lint` passes
- `npm run smoke:sim` passes
- no P0 or P1 bug remains open
- no crash, soft-lock, broken progression path, save-loss bug, or resume-routing bug remains on target devices
- settings do not promise features that are not really implemented
- a final signed release build exists that matches the final accepted source code
- Google Play listing text is ready
- screenshots are ready
- icon art is ready
- pricing is final
- support email is live
- any support URL or privacy-policy URL needed for store submission is live
- Google Play Data safety and privacy answers are complete
- at least 3 to 5 real outside testers can play the opening without help

## What still needs to be decided by the owner

These are the main remaining choices and blanks:

- final launch price, or confirmation that USD 3.99 is correct
- final support email
- support URL
- privacy policy URL
- final public Google Play developer name, or confirmation that `Moonlithe` is correct
- final store screenshots
- final icon and art treatment
- final short description
- final long description
- where the fresh final signed build will be created if the Windows long-path blocker still remains
- the outside tester list

## Recommended next steps

In order:

1. Enable the `main` branch rule in GitHub using `.github/BRANCH_PROTECTION.md`.
2. Install or build the current polished candidate that includes the March 31 UI/copy updates.
3. Run a focused Android regression across title, setup, map, battle, reward, event, recap, resume, and `dev-smoke`.
4. Fix only real blockers found during that regression.
5. Produce a fresh signed build from a shorter-path or different environment if the Windows rebuild blocker still prevents a trustworthy final artifact.
6. Finalize support identity, support email, and live URLs.
7. Prepare the Google Play store assets and listing copy.
8. Run a small outside playtest with real people who do not already know the game.
9. Upload to Google Play internal or closed testing.
10. Fix only blocker bugs or compliance issues found there.
11. Submit the first MVP release.

## Current source of truth

The current source of truth is:

- `PROJECT_HANDOFF_2026-03-31.md`
- `PROJECT_HANDOFF_2026-03-31.docx`
- `PROJECT_HANDOFF_2026-03-30.md`
- `PROJECT_HANDOFF_2026-03-30.docx`
- `PROJECT_HANDOFF_2026-03-27.md`
- `PROJECT_HANDOFF_2026-03-27.docx`
- `PROJECT_HANDOFF_2026-03-24.md`
- `PROJECT_HANDOFF_2026-03-24.docx`
- `DUNGEON_DIVE_APP_NEEDS_2026-03-31.md`
- `README.md`
- `SUPPORT.md`
- `PRIVACY_POLICY.md`

Important note:

- March 24 remains the broad product/system handoff
- March 27 and March 30 remain historical readiness addenda
- March 31 is now the freshest release-planning snapshot

## Bottom line

- the game already has the important game systems
- this is a release-hardening project, not a prototype
- Android only is still the current launch plan
- Google Play only is still the current launch plan
- paid upfront is still the current launch plan
- the current working launch price is USD 3.99 unless testing later supports a change
- no new major features should be added before first upload
- the next most important step is a focused Android regression on the current polished build
- after that, the focus should stay on branch protection, store prep, testing, and submission
