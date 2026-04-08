# Dungeon Dive: Bad Decisions Privacy Policy

Last updated: April 8, 2026

## Current Scope

Dungeon Dive: Bad Decisions is currently being prepared as an offline single-player game for Android and Google Play.

The current build does not require:

- account creation
- cloud sync
- third-party sign-in
- multiplayer identity

## Data Stored On Device

The current app stores gameplay-related information locally on the device so the game can work offline and preserve progress.

This local data currently includes:

- profile progression
- unlocked content
- active run state
- backup autosave state
- archive history
- saved settings flags for accessibility, readability, and comfort preferences
- authored codex/event/lore progress that is unlocked locally through play remains part of that on-device profile/archive data
- in development builds only, the native `dev-smoke` route can show local in-memory UX telemetry counters for manual QA
- in development builds only, `dev-smoke` can also validate a vendor-neutral remote analytics endpoint if a developer explicitly configures one with build-time public environment values
- those dev-only validation paths are not required for normal play, are not part of the public gameplay loop by default, and are not attached to a player account or identity in the current offline release model

## Data The App Does Not Intentionally Send To Moonlithe

In the current offline build, gameplay data is not intentionally transmitted to Moonlithe-operated servers during normal play.

The current source does include a development-only remote analytics validation path for QA, but it is inert unless a developer explicitly configures a test endpoint.

The current app does not require a player email, payment profile, location sharing, cloud account, or third-party login to use the core game loop.

## Platform Providers

Google Play or other platform providers may still collect their own install, payment, diagnostic, or store-related information under their own policies. That platform behavior is separate from the game's own offline save design.

## Support Contact

A final public support inbox still needs to be confirmed before public release.

Until that inbox is live, use the contact details listed with the storefront copy, distributor, or build channel that delivered the build.

If a public privacy-policy URL is hosted for store submission later, it should mirror this repository copy and the released in-app policy text.
