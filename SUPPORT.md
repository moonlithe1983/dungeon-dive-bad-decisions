# Dungeon Dive: Bad Decisions Support

Last updated: April 7, 2026

## Current Launch Defaults

- platform: Android only
- store: Google Play only
- public developer name: Moonlithe
- working launch regions: United States, United Kingdom, Canada, Australia, New Zealand, and Ireland
- working launch price default: `US$3.99` unless external testing later clearly supports `US$4.99`

## Current Support Status

A final public support inbox still needs to be confirmed before public release.

Until that inbox is live, use the support contact listed with the storefront copy, distributor, or build channel that delivered the build.

Support details may vary by region, storefront, or release channel.

## Helpful Bug Report Details

If you report a problem, include:

- device model
- Android version
- app version
- what you expected to happen
- what actually happened
- the exact steps that triggered the issue
- whether the problem remained after closing and reopening the app

## Current Product Notes

- the game is currently being prepared as an offline single-player release
- unfinished settings that do not affect real runtime behavior are intentionally hidden from the live UI
- settings now include a live preview so readability, contrast, and motion choices can be checked before a run starts
- battle, reward, event, and route screens now prioritize the immediate player decision and progressively disclose deeper flavor/detail
- one full 10-floor Android release-build validation pass has already been completed on the prior candidate
- fresh-profile onboarding now starts with a short title intro, an assigned IT Support role briefing, and then three default companion options
- the current polished source now includes compact route choice, loop-facing art panels, stronger defeat recap, authored early-run writing integration, and clearer progressive-disclosure treatment on event/setup screens
- the current build now explains route objectives, combat results, reward claims, and post-run guidance more plainly on first read
- the April 7 local release APK was rebuilt from the current source and verified on Android through title -> new run -> run-map -> battle -> reward -> resume -> end-run
- testers upgrading from a differently signed local build may need to uninstall the older package before installing the current tester APK
- the `Smoke Lab` route is native-dev only and now surfaces local-only UX telemetry for manual QA; it is not part of the public release build or support burden
