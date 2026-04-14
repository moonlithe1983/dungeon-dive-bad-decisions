# Class Extension Checklist

Use this checklist whenever a new playable class is added after launch. The goal is to keep post-launch class additions additive and low-risk instead of depending on tribal memory.

## Required

These surfaces must be updated for every new class:

- [classes.ts](C:\ddbd\src\content\classes.ts)
  - add the class definition
  - set `unlockCost` or `unlockedByDefault`
- [run-hero.ts](C:\ddbd\src\engine\run\run-hero.ts)
  - add a combat profile to `classCombatProfiles`
- [class-actions.ts](C:\ddbd\src\content\class-actions.ts)
  - add the class action kit and labels for `patch`, `escalate`, `stabilize`, and `dodge`
- [company-lore.ts](C:\ddbd\src\content\company-lore.ts)
  - add `classTicketSubjects`
  - add a `classNarratives` entry
  - add explicit route / reward / combat / recap reads if the fallback text is not good enough
- [supplemental-art-sources.ts](C:\ddbd\src\assets\supplemental-art-sources.ts)
  - add a `classEmblemAlignment` entry
  - if the new class needs a new emblem family, add the asset key and sources too

## Strongly Recommended

These are not hard blockers because runtime fallbacks exist, but they should usually be updated in the same release:

- [authored-voice.ts](C:\ddbd\src\content\authored-voice.ts)
  - add a class codex card
- [event-class-hooks.ts](C:\ddbd\src\content\event-class-hooks.ts)
  - add sharper class moments and class-specific event choice bonuses
- [class_reactive_bark_matrix.md](C:\ddbd\writing\class_reactive_bark_matrix.md)
  - add the new class to the bark matrix
- [dialogue_style_guide.md](C:\ddbd\writing\dialogue_style_guide.md)
  - check whether the new class introduces any new voice constraints worth documenting

## Optional But Often Needed

- [team-synergies.ts](C:\ddbd\src\content\team-synergies.ts)
  - add new class-companion synergies if the class would otherwise ship without party identity
- [class-select.tsx](C:\ddbd\app\class-select.tsx)
  - review unlock copy and selection presentation for crowding
- [progression.tsx](C:\ddbd\app\progression.tsx)
  - review unlock economy and next-goal messaging
- [PROJECT_HANDOFF_2026-04-14.md](C:\ddbd\PROJECT_HANDOFF_2026-04-14.md)
  - update the current handoff if the class ships in the next live update

## Validation

Run these before shipping a new class:

```powershell
npm run audit:classes
npx tsc --noEmit
npm run lint
npm run smoke:sim
```

The class audit is meant to catch the minimum required support surfaces. TypeScript, lint, and smoke then confirm the rest of the loop still holds together.
