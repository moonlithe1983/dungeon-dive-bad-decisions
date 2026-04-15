# Release Candidate 2026-04-15

Version date: April 15, 2026

Purpose: record the exact reboot-slice tester APK prepared for the next guided first-session outside-test wave.

## 1. Candidate identity

- source branch at build time: `codex/github-readiness-pass-2026-04-14`
- base HEAD at build start: `53106e612ce3cfbb90de0555552f158f59fdebf3`
- build provenance note: the APK was built from the April 15 working tree rather than from a clean committed snapshot; the working tree already included the support/privacy trust-surface updates and `src/utils/build-info.ts`
- build completed at: `2026-04-15T09:27:48+01:00`
- canonical release output: `C:\ddbd\android\app\build\outputs\apk\release\app-release.apk`
- dated tester copy: `C:\ddbd\release\dungeon-dive-bad-decisions-android-tester-2026-04-15.apk`

## 2. Artifact fingerprint

- file size: `93,135,361` bytes
- SHA-256: `5475AD83D49C610AE83688197FD50EC7D2D48DF0FF64FAB47C0F796428B2C4B5`

## 3. Local gate status before sharing

Passed on the current tree:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run smoke:sim`
- `npm run audit:classes`
- `.\gradlew.bat assembleRelease`
- live Android emulator sanity pass through title -> new run -> run-map -> battle -> reward -> cold relaunch resume -> end-run archive -> cleared active save

## 4. What this candidate is for

Use this APK only for guided first-session validation of the rebooted slice.

Primary proof goals:

- can a new player explain what the game is quickly
- can they justify the first class and companion picks
- can they read the first fight without coaching
- can they explain what a reward or event changed
- do they want another run after the first session
- does the current product shape feel honest at `US$3.99`

Use `C:\ddbd\docs\guided-first-session-test-plan.md` as the moderator script and evidence template.

## 5. Known constraints before wider distribution

- this build is coherent enough for guided outside testing, not proof of public launch readiness
- the old April 8 tester APK is historical only and should not be used as the current reference build
- the existing 10-floor runtime is still not assumed to be sufficient public-launch scope by default
- premium launch at `US$3.99` remains a gate that must be justified by outside evidence

## 6. Real-device checks still required

Run these checks on physical Android phones during the guided wave:

- install and first launch
- title to onboarding flow
- class select
- companion select
- run map readability
- first battle readability
- reward or event consequence clarity
- end-run or recap follow-through
- cold relaunch resume
- support and privacy route readability

## 7. Notes from the build

- the release build succeeded after setting `JAVA_HOME`, `ANDROID_HOME`, `ANDROID_SDK_ROOT`, and a workspace-local `GRADLE_USER_HOME`
- Gradle reported JVM metaspace pressure and restarted the daemon after the build; this did not block artifact creation
- the build output also logged a `NODE_ENV` warning and transient `ENOENT` reads under `.gradle-user`; the APK was still packaged successfully, but those warnings are worth keeping in mind if future release builds become unstable
- because the artifact was built from a dirty working tree, rebuild from the final merged commit before any broader distribution that requires strict commit-to-artifact provenance
