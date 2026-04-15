# Low-Data Launch Evidence Plan

Version date: April 15, 2026

Purpose: define the manual proof package required if the game launches without production analytics or crash reporting.

This plan only applies if the public build keeps the repo's current offline-first, no-production-telemetry stance.

## 1. Launch stance

Current default stance:

- no account requirement
- no cloud sync
- no normal-play telemetry intentionally sent to Moonlithe-operated services by default
- no production analytics or crash SDK should be assumed live unless explicitly added and verified

If this stance changes, replace this plan with a verified production measurement plan before launch.

## 2. What manual evidence must replace live telemetry

If there is no production telemetry, the launch decision must still be backed by concrete evidence.

Collect all of the following:

- guided first-session observation notes from real-phone testing
- build ledger tying every tester APK to an exact source commit and output path
- install success notes across a small Android device spread
- title-to-recap path verification notes on the exact release candidate build
- support intake readiness proof
- privacy/support/store-copy alignment proof
- pricing-honesty feedback from outside testers

## 3. Required proof packet before public launch

Prepare one packet per serious release candidate.

### 3.1 Build ledger

Record:

- source branch
- commit SHA
- build date
- APK filename
- APK path
- signing context
- release notes for what changed since the previous tester build

### 3.2 Guided test summary

For each tester, record:

- device model
- Android version
- install success or failure
- whether onboarding made sense
- whether class and companion picks felt desirable
- whether the first fight was readable
- whether reward/event consequence was understood
- whether the tester wanted another run
- whether `US$3.99` felt honest

### 3.3 Main-path sanity pass

On the exact release candidate, verify:

- title
- first-run onboarding
- class select
- companion select
- run map
- battle
- reward and event resolution
- cold relaunch resume
- end-run recap
- progression follow-through
- support route
- privacy route

### 3.4 Trust-surface alignment

Check that all of these agree with each other:

- in-app support text
- in-app privacy text
- hosted privacy policy URL
- Play listing copy
- Data safety declaration

## 4. Bug triage rule

Without live production telemetry, launch only if the candidate build has:

- no install blockers on the target device slice
- no repeatable crash on the main path
- no resume corruption on the main path
- no support/privacy/store-copy mismatch
- no repeated first-session confusion that would obviously convert into bad reviews

## 5. Support readiness minimum

Before public release under the low-data plan:

- confirm the public support inbox owner
- confirm response expectations and triage workflow
- confirm where bug reports will be logged
- confirm who updates support/privacy/store text if the data model changes

## 6. Exit condition

This low-data evidence plan stops being sufficient if:

- the game adds live services that materially change the support burden
- the release scale grows beyond what manual review can reasonably cover
- the team decides to enable production analytics or crash reporting
