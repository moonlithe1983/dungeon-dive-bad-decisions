# Dungeon Dive: Bad Decisions App Needs

Current as of March 30, 2026

## Current launch decisions

These are the current working decisions:

- launch on Android only
- launch on Google Play only
- do not treat iOS as part of the current launch plan
- keep feature freeze in place
- do not add new classes, new companions, or big new systems before the first upload
- allow only bug fixes, wording polish, store-compliance fixes, and very small quality-of-life changes
- use paid upfront as the safest version 1 launch plan
- current working launch price: USD 3.99 unless testing later clearly supports USD 4.99
- current placeholder support email: `support@yourdomain.com`
- current public Google Play developer name in project docs: `Moonlithe`
- treat accessibility as a live product requirement, not a future backlog item

## What is already true about the product

The game already does the big important game things. The current MVP already includes:

- a real title screen
- real class select
- real companion select
- exactly 2 companion picks for a run
- a real run map
- real battles
- real rewards
- real events
- real end-run recap screens
- real progression screens
- a real hub
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

## What changed since the March 27 summary

The product has moved forward in a few important ways:

- class-specific story framing is now much stronger and is built around `Crown Meridian Holdings`, `Project Everrise`, and `Meridian Spire`
- class select, run map, battle intros, and event class reads now speak to the player as the chosen class rather than flatter generic office copy
- the duplicate `Claim Pending Reward` button on the map flow was fixed
- the battle combat log now renders above the action list, which better supports story and turn readability on mobile
- the live settings route now includes real accessibility and theme controls:
  - named color presets
  - text-size controls
  - high contrast
  - reduced motion
  - color assist
  - dyslexia-friendly spacing
  - screen-reader hints
- shared controls, screen chrome, and the archive/reference flow now respect the saved accessibility/theme profile
- companion bond growth has a stronger gameplay effect and is surfaced more clearly in companion selection
- baseline combat and rewards are less forgiving than the earlier release-candidate state
- `npm run smoke:sim` is now deterministic, so CI and local reruns test the same authored tower instead of drifting across random seeds

## Android release work already completed

Android release work already completed includes:

- a native Android project exists in `android/`
- local Android release artifacts already exist under `android/app/build/outputs`
- a local APK already exists
- a local AAB already exists
- release signing no longer depends on the debug keystore
- release build smoke already covered title, new-run setup, run-map entry, and relaunch/resume
- release build smoke also covered direct resume into an active battle route
- release build smoke also covered a real combat action and battle-to-reward handoff
- a newer live Android dev-build smoke on March 27, 2026 also covered resume -> event choice -> floor transition -> battle -> reward claim -> map return

## Automated checks already confirmed

Automated checks already confirmed on the current March 30, 2026 repo state:

- `npx tsc --noEmit` passed
- `npm run lint` passed
- `npm run smoke:sim` passed
- `npm run smoke:sim` now uses a deterministic seeded path so CI and local reruns exercise the same authored tower

## What is still the safest recommendation

These parts are still the safest plan:

- stay in feature freeze
- treat the project as release hardening, not feature building
- keep the first launch small and simple
- keep the first launch Android only
- keep the first launch Google Play only
- keep paid upfront as the simplest monetization plan for version 1
- keep the current working price at USD 3.99 unless there is a deliberate decision to change it later
- do not reopen iOS scope unless that choice is made on purpose later
- do not reopen major content scope before the first store upload

## Biggest current risks

The biggest remaining risks are not missing game systems. The biggest remaining risks are release and launch risks. They are:

- no completed full 10-floor manual release-build playthrough yet
- the current Windows workspace still has a release rebuild blocker caused by a long-path native build failure in `react-native-screens`
- the final public support inbox is still not locked
- support URL and privacy-policy URL still need to be finalized and hosted publicly before submission
- store screenshots, store copy, icon, ratings answers, privacy answers, and support links are not all finalized yet
- small external playtesting has not happened yet
- GitHub branch protection still needs to be turned on manually so CI is required before merges to `main`
- the full palette/accessibility rollout is not yet migrated across every older route and panel style
- the newer sharper class-specific tone still needs deeper propagation through more companion, reward, encounter, and event writing

## What must happen before upload

The game should be treated as ready for Google Play only when all of the following are true:

- one full 10-floor run is completed on an Android release-candidate build
- that full run confirms rewards, events, bosses, archive recap, and resume all work correctly
- `dev-smoke` near-win works on Android
- `dev-smoke` near-loss works on Android
- `npx tsc --noEmit` passes
- `npm run lint` passes
- `npm run smoke:sim` passes
- no P0 or P1 bug remains open
- there is no crash, soft-lock, broken progression path, save-loss bug, or resume-routing bug on target devices
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
- final support email, or confirmation that the placeholder will be replaced soon
- support URL
- privacy policy URL
- final public Google Play developer name, or confirmation that `Moonlithe` is correct
- final store screenshots
- final icon and art treatment
- final short description
- final long description
- where the fresh final signed build will be created if the Windows long-path blocker still remains
- the small outside tester list

## Recommended next steps

In order:

1. Run one full manual 10-floor dive on an Android release-candidate build.
2. Verify floor-start companion rotation, all 3 bosses, rewards, events, archive recap, and resume after relaunch.
3. Fix only real blockers found during that test.
4. Produce a fresh signed build from a shorter-path or different environment if the Windows rebuild blocker still prevents a trustworthy final artifact.
5. Finalize support identity, support email, and live URLs.
6. Prepare the Google Play store assets and listing copy.
7. Run a small outside playtest with real people who do not already know the game.
8. Upload to Google Play internal or closed testing.
9. Fix only blocker bugs or compliance issues found there.
10. Submit the first MVP release.

## Current source of truth

The current source of truth is:

- `PROJECT_HANDOFF_2026-03-24.md`
- `PROJECT_HANDOFF_2026-03-24.docx`
- `PROJECT_HANDOFF_2026-03-27.md`
- `PROJECT_HANDOFF_2026-03-27.docx`
- `PROJECT_HANDOFF_2026-03-30.md`
- `PROJECT_HANDOFF_2026-03-30.docx`
- `README.md`
- `SUPPORT.md`
- `PRIVACY_POLICY.md`

Important note:

- the full product/system handoff was last refreshed on March 24, 2026
- the latest readiness addenda were refreshed on March 27 and March 30, 2026
- this document is a simple summary of that state

## Bottom line

- the game already has the hard game systems
- this is not a tiny prototype anymore
- this is now a release-hardening project
- Android only is the current launch plan
- Google Play only is the current launch plan
- paid upfront is the current launch plan
- the current working launch price is USD 3.99 unless testing later supports a change
- no new major features should be added before the first upload
- the next most important step is one full Android release-build playthrough
- after that, the focus should stay on polish, store prep, testing, and submission
