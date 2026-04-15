# Guided First-Session Test Plan

Version date: April 15, 2026

Purpose: run the next outside-test wave against the rebooted slice only after the build is coherent enough to test honestly.

## 1. Test gate before sharing any build

Do not send a new APK until all of the following are true:

- the current build reflects the rebooted slice, not the historical April 8 tester state
- the main path works on-device: title -> onboarding -> class select -> companion select -> run map -> battle -> reward or event -> end-run or recap follow-through
- support/privacy copy in the shipped build matches the repo markdown and the intended launch stance
- the team can identify the exact source commit and APK path used for the test wave

## 2. What this test wave is trying to prove

This wave is not a broad content test. It is a first-session clarity and value test.

Primary questions:

- What kind of game do testers think this is in the first 30 seconds?
- What do they think their first meaningful choice is?
- Can they read what happened in the first fight without coaching?
- Can they explain what a reward or event changed?
- Do they want another run after the first session?
- Does the current product shape feel honest at a premium `US$3.99` ask?

## 3. Suggested tester mix

Run a small guided batch first:

- 3 to 5 Android players for the first coherence pass
- at least 1 tester who plays mobile roguelites often
- at least 1 tester who plays games casually and is not already primed on the design docs
- at least 1 tester on a narrower or older Android phone if available

Do not scale to a wider wave until this small batch stops surfacing repeated first-session confusion.

## 4. Device checklist

For each guided session, record:

- tester name or alias
- phone model
- Android version
- app version
- APK filename
- source commit or branch
- whether the tester had to uninstall an older signed build first

## 5. Moderator script

Use this script as closely as possible so sessions stay comparable.

### 5.1 Opening prompt

Say:

`Please play normally and think out loud. I am testing the game, not testing you. I will only step in if you get blocked by install or a hard bug.`

Do not explain the fiction, combat rules, or intended replay loop before they encounter it.

### 5.2 During title and onboarding

Ask only after they naturally pause:

- `What do you think this game is about so far?`
- `What do you think you are supposed to do next?`

### 5.3 During class and companion choice

Ask:

- `Why did you pick that class?`
- `Why did you pick that companion over the others?`

Success bar:

- the answer should refer to appeal, role, or expected usefulness rather than confusion or random guessing

### 5.4 During the first fight

Ask after one or two turns:

- `What happened that turn?`
- `What do you think your best next move is?`

Success bar:

- the tester can explain damage, danger, and next action without being coached through hidden state

### 5.5 During the first reward or event

Ask immediately after the choice resolves:

- `What changed because of that choice?`

Success bar:

- the tester can name the before-and-after effect in plain language

### 5.6 After the first recap or stop point

Ask:

- `Would you want another run right now? Why or why not?`
- `If this cost $3.99 today, would that feel honest yet?`

## 6. Evidence template

Record each session using this structure:

- First read:
  - what the tester thought the game was
  - whether they found Settings / Accessibility quickly enough
- First meaningful choice:
  - what they believed the choice was
  - whether they could justify the class and companion picks
- First fight:
  - what they thought hurt them
  - whether the recommended action and turn-impact surfaces made sense
- First reward or event:
  - what they believed changed
  - whether the screen showed enough consequence without hunting
- Replay pull:
  - whether they wanted another run
  - whether they understood why another run would differ
- Price honesty:
  - whether `US$3.99` felt justified
- Bugs / blockers:
  - install blockers
  - clarity blockers
  - crashes or resume issues

## 7. Decision rules after the wave

Use the smallest honest next move:

- confusion but interest: fix onboarding, terminology, or room clarity inside the rebooted slice
- understood but weak enthusiasm: improve room feel, reward excitement, and replay motivation before expanding scope
- interest but weak price confidence: revisit monetization or positioning instead of forcing premium
- repeated install/resume/support/privacy mismatches: treat as release-trust blockers
- repeated "I finished but do not know why I should run again": treat recap and progression motivation as a slice blocker

## 8. What not to do

- do not coach testers through the intended answers
- do not treat a single enthusiastic friend as proof of pricing or product shape
- do not widen scope to compensate for a weak first-session loop
- do not cut a new APK just because a calendar date changed
