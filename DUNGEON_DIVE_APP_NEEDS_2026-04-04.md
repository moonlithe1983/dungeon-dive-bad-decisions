# Dungeon Dive: Bad Decisions App Needs

Current as of April 4, 2026

## Current launch decisions

These are still the current working decisions:

- launch on Android only
- launch on Google Play only
- do not treat iOS as part of the current launch plan
- keep feature freeze in place
- do not add new classes, new companions, or large new systems before first upload
- allow only bug fixes, wording polish, store-compliance fixes, and very small quality-of-life changes
- use paid upfront as the safest version 1 launch plan
- current working launch price: USD 3.99 unless testing later clearly supports USD 4.99
- final public support inbox still needs owner confirmation
- current public Google Play developer name in project docs: `Moonlithe`
- treat accessibility as a live product requirement, not a future backlog item

## What is already true about the product

The game already has the main MVP and release-candidate systems in place:

- title screen
- companion select
- class-select fallback / assigned-role briefing
- exactly 2 companion picks for a run
- route-choice run map
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
- active save slot
- backup autosave slot
- archive history for completed runs
- archive-backed recap and progression data
- a full 10-floor run
- 3 biomes
- bosses on floors 4, 7, and 10
- 5 total classes in the game data
- 5 total companions in the game data
- 3 companions unlocked by default at the start
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

## What changed in the April 4 pass

- the live build now carries a stronger authored voice layer on the most visible screens
- floors 1 to 3 now surface locked lore beats directly on the run map
- the starting trio now has visible chemistry lines in setup, route choice, rewards, events, and danger states
- codex entries for classes and companions now feel more like in-world archive material
- the first three authored early-biome event sheets now overlay the live event system
- defeat recap advice now carries stronger next-run voice
- the repo was revalidated after that content pass:
  - `npx tsc --noEmit` passed
  - `npm run lint` passed
  - `npm run smoke:sim` passed

## Biggest current risks

The biggest remaining risks are still release and validation risks rather than missing systems:

- the current source still needs a focused Android gameplay regression after the April 4 authored-writing pass
- route-choice readability, event readability, and defeat recap usefulness still need real-device confirmation
- the opening may now read better, but it still needs outside tester proof that it actually creates restart impulse
- a fresh final signed build from the final accepted source is still needed, with `C:\ddbd` now the preferred canonical build workspace
- support email, support URL, and privacy-policy URL still need to be finalized for store submission
- Google Play listing assets and copy are not all finalized yet
- a small outside playtest on the newer polished build has still not happened

## What must happen before upload

The game should be treated as ready for Google Play only when all of the following are true:

- the current source has been checked on Android after the April 4 authored-writing pass
- title, setup, route-choice map flow, rewards, events, bosses, archive recap, resume, and `dev-smoke` all still work on that build
- `npx tsc --noEmit` passes
- `npm run lint` passes
- `npm run smoke:sim` passes
- no P0 or P1 bug remains open
- no crash, soft-lock, broken progression path, save-loss bug, or resume-routing bug remains on target devices
- the live UI does not promise features that are not implemented
- at least 3 to 5 real outside testers can get through the opening without help
- those testers can explain:
  - what kind of game this is
  - what their first meaningful choice was
  - what killed them
  - whether they wanted another run
- a final signed release build exists that matches the final accepted source code
- Google Play listing text is ready
- screenshots are ready
- icon art is ready
- pricing is final
- support email is live
- any support URL or privacy-policy URL needed for store submission is live
- Google Play Data safety and privacy answers are complete

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
- whether the final signed build will be produced in the canonical `C:\ddbd` workspace or in another trusted environment
- the outside tester list

## Recommended next steps

In order:

1. Run the focused Android gameplay regression on route-choice run map, battle, reward, event, end-run, resume, and `dev-smoke`.
2. Fix only real blockers found during that regression.
3. Produce a fresh signed build from the canonical `C:\ddbd` workspace, or use another trusted environment only if that final rebuild cannot be completed there.
4. Finalize support identity, support email, and live URLs.
5. Prepare the Google Play store assets and listing copy.
6. Run a small outside playtest with people who do not already know the game.
7. Upload to Google Play internal or closed testing.
8. Fix only blocker bugs or compliance issues found there.
9. Submit the first MVP release.

## Current source of truth

The current source of truth is:

- `PROJECT_HANDOFF_2026-04-04.md`
- `PROJECT_HANDOFF_2026-04-04.docx`
- `DUNGEON_DIVE_APP_NEEDS_2026-04-04.md`
- `PROJECT_HANDOFF_2026-04-02.md`
- `PROJECT_HANDOFF_2026-03-31.md`
- `PROJECT_HANDOFF_2026-03-30.md`
- `PROJECT_HANDOFF_2026-03-27.md`
- `PROJECT_HANDOFF_2026-03-24.md`
- `README.md`
- `SUPPORT.md`
- `PRIVACY_POLICY.md`
- `.github/BRANCH_PROTECTION.md`

Important note:

- March 24 remains the broad product/system handoff
- March 31 remains the previous polish/readiness snapshot
- April 2 remains the route-choice/readability snapshot
- April 4 is now the freshest release-planning, authored-voice, and validation snapshot

## Bottom line

- the game already has the important systems
- this is still a release-hardening project, not a prototype
- the strongest new improvement is not another feature, but a more coherent and commercially useful voice layer in the live game
- the next most important step is still focused Android gameplay validation on the current build
- after that, effort should stay on store prep, outside testing, and submission rather than scope growth

