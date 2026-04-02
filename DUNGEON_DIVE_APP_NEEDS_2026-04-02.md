# Dungeon Dive: Bad Decisions App Needs

Current as of April 2, 2026

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
- final public support inbox still needs owner confirmation
- current public Google Play developer name in project docs: `Moonlithe`
- treat accessibility as a live product requirement, not a future backlog item

## What is already true about the product

The game already has the major MVP and release-candidate systems in place:

- title screen
- companion select
- class-select fallback / assigned-role briefing
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

## What changed in the April 2 readiness pass

- GitHub readiness improved again:
  - the repo `main` ruleset is now active in the canonical GitHub repository
  - `.github/BRANCH_PROTECTION.md` now reflects GitHub's current ruleset UI
- The opening flow now behaves more like a real release build:
  - fresh profiles no longer get a fake class-choice step when only IT Support is unlocked
  - fresh runs go from title directly to companion select
  - `class-select` now reads as an assigned-role briefing until more classes are unlocked
- The starting roster now contains three default companions instead of two:
  - Facilities Goblin
  - Former Executive Assistant
  - Security Skeleton
- Existing profiles are normalized so older saves also receive that minimum opening roster.
- Root docs now better match the current build:
  - `README.md`
  - `SUPPORT.md`
  - `PRIVACY_POLICY.md`
- A current Android visual sweep confirmed the latest onboarding/settings/support/privacy wording reads cleanly in context on the live debug build.
- The active gameplay presentation was tightened:
  - run map now focuses on the current floor and explicit route picks
  - battle now surfaces intent, HP, statuses, and action tradeoffs before deeper rules text
  - reward now centers the package choice before the payout paperwork
  - end-run now includes a real defeat recap instead of only broad archive stats
- The smoke simulation was updated so it validates the route-choice map structure and uses deterministic attempts instead of the older forced-path assumption.

## Automated checks confirmed on the April 2 repo state

- `npx tsc --noEmit` passed
- `npm run lint` passed
- `npm run smoke:sim` passed

## Android validation currently covered

Android validation already covered includes:

- a native Android project exists in `android/`
- local Android release artifacts already exist under `android/app/build/outputs`
- a local APK already exists
- a local AAB already exists
- one full manual 10-floor Android release-build playthrough was previously completed on the prior candidate
- earlier Android smoke covered resume -> event choice -> floor transition -> battle -> reward claim -> map return
- the current source has now had an additional April 2 visual sweep on Android debug build for:
  - title
  - companion select
  - assigned-role / `class-select` fallback
  - settings
  - support
  - privacy
  - no-active-run `run-map`

Important note:

- the current source still needs a focused gameplay regression on the route-choice run map, battle, reward, event, end-run, resume, and native `dev-smoke`
- a fresh signed final artifact built from the latest accepted source is still desirable before store-facing testing

## Biggest current risks

The biggest remaining risks are launch and release-process risks, not missing game systems:

- the current source still needs a focused Android gameplay regression on the routes not covered by the earlier April 2 visual sweep and not yet re-checked after the newer route-choice / defeat-summary pass
- the new route-choice flow needs real-device confirmation that it feels clearer and more compelling instead of simply shorter
- the new defeat recap needs real-device confirmation that it actually increases restart impulse after losses
- the final public support inbox is still not locked
- support URL and privacy-policy URL still need to be finalized and hosted publicly before submission
- store screenshots, store copy, icon, ratings answers, privacy answers, and support links are not all finalized yet
- a small outside playtest on the newer polished build has not happened yet
- the Windows workspace may still have a long-path native rebuild blocker when producing a fresh final signed artifact

## What must happen before upload

The game should be treated as ready for Google Play only when all of the following are true:

- the current polished build has been checked on Android after the April 2 onboarding/docs pass
- title, setup, route-choice map flow, rewards, events, bosses, archive recap, resume, and `dev-smoke` all still work on that current build
- `npx tsc --noEmit` passes
- `npm run lint` passes
- `npm run smoke:sim` passes
- no P0 or P1 bug remains open
- no crash, soft-lock, broken progression path, save-loss bug, or resume-routing bug remains on target devices
- the opening flow no longer presents a fake class choice on fresh profiles
- the live UI does not promise features that are not really implemented
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

1. Run the focused Android gameplay regression on route-choice run map, battle, reward, event, end-run, resume, and `dev-smoke`.
2. Fix only real blockers found during that regression.
3. Produce a fresh signed build from a shorter-path or different environment if the Windows rebuild blocker still prevents a trustworthy final artifact on this machine.
4. Finalize support identity, support email, and live URLs.
5. Prepare the Google Play store assets and listing copy.
6. Run a small outside playtest with real people who do not already know the game.
7. Upload to Google Play internal or closed testing.
8. Fix only blocker bugs or compliance issues found there.
9. Submit the first MVP release.

## Current source of truth

The current source of truth is:

- `PROJECT_HANDOFF_2026-04-02.md`
- `PROJECT_HANDOFF_2026-04-02.docx`
- `PROJECT_HANDOFF_2026-03-31.md`
- `PROJECT_HANDOFF_2026-03-31.docx`
- `PROJECT_HANDOFF_2026-03-30.md`
- `PROJECT_HANDOFF_2026-03-30.docx`
- `PROJECT_HANDOFF_2026-03-27.md`
- `PROJECT_HANDOFF_2026-03-27.docx`
- `PROJECT_HANDOFF_2026-03-24.md`
- `PROJECT_HANDOFF_2026-03-24.docx`
- `DUNGEON_DIVE_APP_NEEDS_2026-04-02.md`
- `README.md`
- `SUPPORT.md`
- `PRIVACY_POLICY.md`
- `.github/BRANCH_PROTECTION.md`

Important note:

- March 24 remains the broad product/system handoff
- March 31 remains the previous polish/readiness snapshot
- April 2 is now the freshest release-planning and GitHub-readiness snapshot

## Bottom line

- the game already has the important game systems
- this is still a release-hardening project, not a prototype
- the opening flow is now more honest and more commercially presentable than it was on March 31
- the active run flow is now more choice-first and less text-dense than it was earlier on April 2
- archived losses are now more informative and should be tested specifically for restart impulse
- Android only is still the current launch plan
- Google Play only is still the current launch plan
- paid upfront is still the current launch plan
- the current working launch price is USD 3.99 unless testing later supports a change
- no new major features should be added before first upload
- the next most important step is a focused Android gameplay regression on the current build
- after that, the focus should stay on store prep, outside testing, and submission
