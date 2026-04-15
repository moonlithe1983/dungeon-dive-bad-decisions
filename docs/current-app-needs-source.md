# Dungeon Dive: Bad Decisions
## App Needs

Version date: April 15, 2026

Current state:

- controlled partial restart is in progress
- the repo/docs/app consistency pass now reflects the April 15 tester-build and live-smoke state
- the dated April 15 handoff and APP_NEEDS `.docx` files should be treated as the current source-of-truth pair after this refresh
- the latest dated outside-share build in the workspace is `release/dungeon-dive-bad-decisions-android-tester-2026-04-15.apk`
- the April 15 guided-smoke candidate completed a live Android sanity pass through title, new run, battle, reward, resume, and end-run archive flow without exposing a reproducible blocker
- premium pricing is still a release gate, not a settled product truth

What the app needs next:

1. Run guided first-session tests on real Android phones using the April 15 tester APK and `docs/guided-first-session-test-plan.md`.
2. Capture only the evidence needed for the next decision:
   - what kind of game testers think this is
   - what their first meaningful choice was
   - what happened in the first fight
   - whether they wanted another run
   - whether upfront pricing feels honest
3. Decide from evidence:
   - confusion but interest: fix onboarding / clarity inside the reboot slice
   - interest but not worth upfront price: pivot monetization / positioning
   - understood but not compelling: consider a deeper redesign or restart
4. Finalize public support inbox, hosted privacy/support URLs if needed, Play listing assets, Data safety answers, and launch measurement/support stance.
5. Rebuild the tester APK only after runtime source changes land or the current candidate is invalidated by a blocker fix.
6. Fix only blocker bugs or compliance issues found during outside testing and store prep.

Do not do next:

- do not treat the current legacy 10-floor runtime as the accepted launch shape
- do not create another tester APK just because the calendar changed if the runtime did not
- do not lock a premium launch at `US$3.99` without outside proof
- do not expand content breadth to compensate for a weak core loop
