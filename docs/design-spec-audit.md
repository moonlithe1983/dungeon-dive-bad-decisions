# Design Spec Audit

Source spec: `C:/ddbd/dungeon_crawler_mobile_design_spec_codex.md`

This is a living audit, not a marketing claim. Status values mean:

- `met`: materially implemented in the current repo state.
- `partial`: some meaningful support exists, but the full requirement is not satisfied yet.
- `not yet`: not materially implemented in the current repo state.

## Section Audit

| Spec section | Status | Notes | Key refs |
| --- | --- | --- | --- |
| `1. Product Goal` | `partial` | The game is mobile-first, readable, replayable, and progression-driven, but it is not the action roguelite described by the spec. | `app/index.tsx`, `app/run-map.tsx`, `app/battle.tsx`, `app/progression.tsx` |
| `2.1 Player Experience` | `partial` | Strong next-goal and route clarity exist, but tactile movement/dodge feel is outside the current design. | `src/progression/next-goal.ts`, `app/index.tsx`, `app/run-map.tsx`, `app/battle.tsx` |
| `2.2 Product Health` | `not yet` | Retention, conversion, and live-ops health foundations are still not proven in the runtime, even though the release gate and roadmap are now documented in `docs/launch-postlaunch-retention-plan.md`. | `src/analytics/schema.ts`, `src/analytics/client.ts`, `docs/launch-postlaunch-retention-plan.md` |
| `2.3 Technical Quality` | `partial` | Resume/restart/readability foundations are strong, but target-device performance, launch monitoring choice, and release-build proof are still incomplete. | `src/save/runRepo.ts`, `app/_layout.tsx`, `src/hooks/use-responsive-layout.ts`, `docs/launch-postlaunch-retention-plan.md` |
| `3. High-Level Product Thesis` | `not yet` | The repo is a mobile-native turn-based roguelite, not a movement/dodge-driven action roguelite. | `app/battle.tsx`, `src/engine/battle/combat-engine.ts` |
| `4.1 Clarity Before Complexity` | `partial` | The UI explains route, reward, event, and progression states well, but combat/action readability is still for a turn-based model rather than the action model in the spec. | `app/onboarding.tsx`, `app/run-map.tsx`, `app/reward.tsx`, `app/event.tsx` |
| `4.2 Agency Without Friction` | `partial` | Choices are meaningful and low-friction, but some deeper assist/remap systems are still missing. | `app/run-map.tsx`, `app/reward.tsx`, `app/event.tsx`, `app/settings.tsx` |
| `4.3 Short-Term Fun + Long-Term Goals` | `partial` | Runs and meta goals are present, and the post-win ladder framing is now explicit, but long-tail content breadth is still limited. | `app/index.tsx`, `app/hub.tsx`, `app/progression.tsx`, `src/progression/next-goal.ts` |
| `4.4 Accessibility Is Core Design` | `partial` | Text scaling, contrast, motion, reader hints, audio controls, haptics toggles, handedness bias, and combat-action remapping now exist; hardware controller input is still not implemented. | `app/settings.tsx`, `app/_layout.tsx`, `src/theme/app-theme.ts`, `src/state/systemAccessibilityStore.ts`, `src/input/combat-input.ts` |
| `4.5 Monetization Must Preserve Trust` | `not yet` | Monetization systems are not implemented. | `n/a` |
| `4.6 Live-Ops Ready Architecture` | `partial` | A lot of content is data-driven, but live-ops systems themselves are not implemented. | `src/content/*`, `src/engine/*`, `src/types/*` |
| `5.1 Micro Loop` | `partial` | There is a readable action-selection loop, but not the real-time movement/attack/dodge loop described by the spec. | `app/battle.tsx`, `src/engine/battle/combat-engine.ts` |
| `5.2 Room / Encounter Loop` | `met` | Enter room, read threat, resolve, collect reward, transition is implemented. | `app/run-map.tsx`, `app/battle.tsx`, `app/reward.tsx`, `app/event.tsx` |
| `5.3 Floor Loop` | `partial` | Floors have escalation and closure, but density and variation breadth are still modest. | `app/run-map.tsx`, `src/assets/supplemental-art-sources.ts`, `src/engine/run/progress-run.ts` |
| `5.4 Run Loop` | `partial` | Start, build, climax, and post-run conversion exist, but the target pacing and checkpoint model are not fully tuned. | `src/state/runStore.ts`, `app/end-run.tsx`, `app/progression.tsx` |
| `5.5 Meta Loop` | `partial` | There is visible next-goal and persistent progression, and post-win Truth / Roster / Relationship ladders are now surfaced, but daily/weekly goal structure is not built. | `src/progression/next-goal.ts`, `app/hub.tsx`, `app/progression.tsx`, `docs/launch-postlaunch-retention-plan.md` |
| `5.6 Seasonal / Live-Ops Loop` | `not yet` | Seasonal and live-ops structures are not implemented in the product yet, though a quarterly roadmap is now documented. | `docs/launch-postlaunch-retention-plan.md` |
| `6. Session Design and Pacing` | `partial` | Short session support and resume are good, but target pacing is not formally tuned/validated. | `app/index.tsx`, `app/run-map.tsx`, `src/save/runRepo.ts` |
| `7. Combat Design Requirements` | `partial` | Readable turn-based combat still defines the game, but the battle loop now includes a remappable dodge/tempo action and controller-ready input hints. | `app/battle.tsx`, `src/types/combat.ts`, `src/engine/battle/combat-engine.ts`, `src/input/combat-input.ts` |
| `8. Floor Structure and Encounter Density` | `partial` | Floor structure exists with route choice and escalation, but not the fuller encounter taxonomy from the spec. | `app/run-map.tsx`, `src/types/run.ts`, `src/content/events.ts` |
| `9. Information Hierarchy and HUD` | `partial` | Current screens prioritize immediate choices over meta clutter, but HUD customization is limited. | `app/run-map.tsx`, `app/battle.tsx`, `app/reward.tsx`, `app/event.tsx` |
| `10. UX Principles` | `partial` | Menu flow and cause/effect are strong; advanced HUD/input customization is still missing. | `app/index.tsx`, `app/settings.tsx`, `src/components/game-button.tsx` |
| `11. Accessibility and Universal Design` | `partial` | Visual, cognitive, and audio accessibility improved significantly; input accessibility remains incomplete. | `app/settings.tsx`, `app/_layout.tsx`, `src/state/systemAccessibilityStore.ts`, `src/audio/ui-sfx.ts` |
| `12. User Agency Requirements` | `partial` | The player can inspect, replay tutorial, pause reading, and choose distinct rewards/events, but high-cost assist/remap systems are not there. | `app/onboarding.tsx`, `app/reward.tsx`, `app/event.tsx`, `app/settings.tsx` |
| `13. Tutorials and Onboarding` | `partial` | The FTUE is now interactive, short, contextual, skippable, and replayable, but it is still a guided simulation rather than a full live run. | `app/onboarding.tsx`, `src/content/onboarding.ts` |
| `14. Language, Copy, and Terminology` | `partial` | Voice and terminology are consistent, but localization-readiness is still limited. | `src/content/*`, `app/*` |
| `15. Graphics and Art Direction Requirements` | `partial` | Art integration is strong and readability-aware, but the full action-game readability rules are only partially applicable. | `src/assets/*`, `src/components/loop-art-panel.tsx`, `app/run-map.tsx`, `app/battle.tsx` |
| `16. Audio and Haptics Requirements` | `partial` | UI cues, haptics, toggle, and channel sliders exist, but full mix coverage and haptic intensity are not implemented. | `src/audio/ui-sfx.ts`, `src/haptics/ui-haptics.ts`, `app/settings.tsx` |
| `17. Progression Design Requirements` | `partial` | Run-to-meta carry-forward, next goals, and post-run surfacing exist, but collection breadth and long goal decomposition are still limited. | `app/end-run.tsx`, `src/progression/next-goal.ts`, `app/progression.tsx` |
| `18. Economy and Monetization Guardrails` | `not yet` | No monetization systems are present yet. | `n/a` |
| `19. Social and Live-Ops Systems` | `not yet` | Social, events framework, and live-ops surfaces are not implemented. | `n/a` |
| `20. Technical Requirements` | `partial` | Save/resume and data-driven foundations exist, but performance validation and device-scaling validation are still incomplete. | `src/save/*`, `src/content/*`, `src/types/*`, `src/hooks/use-responsive-layout.ts` |
| `21. Analytics and Experimentation` | `partial` | Vendor-neutral schema/client exist, key events are wired, and remote delivery/validation scaffolding now exists, but no production analytics vendor is chosen or validated end to end. | `src/analytics/schema.ts`, `src/analytics/client.ts`, `src/analytics/http-adapter.ts`, `src/analytics/remote-config.ts`, `app/dev-smoke.tsx`, `app/onboarding.tsx`, `app/settings.tsx`, `src/state/runStore.ts`, `app/run-map.tsx`, `app/battle.tsx`, `app/reward.tsx`, `app/event.tsx` |
| `22. What to Avoid` | `partial` | Several pitfalls are actively avoided, but the action-game-specific pitfalls remain untestable until the product shifts. | `app/index.tsx`, `app/onboarding.tsx`, `app/settings.tsx` |
| `23. Implementation Priority Order` | `partial` | The repo broadly spans later phases, but it does not follow the exact spec roadmap because the core combat model differs. | `app/*`, `src/*` |

## Acceptance Checklist Audit

### 24.1 Combat and Readability

| Requirement | Status | Notes | Key refs |
| --- | --- | --- | --- |
| Player can identify hazards immediately. | `partial` | True for the current turn-based encounter read, not for a real-time hazard field. | `app/battle.tsx` |
| Player can tell why damage was taken. | `partial` | Combat logs and status summaries help, but this is not a full action-combat damage-read model. | `app/battle.tsx`, `src/content/statuses.ts` |
| Telegraphs remain visible during heavy VFX. | `partial` | Current battle UI avoids heavy VFX, but the action-spec requirement is not fully applicable yet. | `app/battle.tsx` |
| Enemy roles are visually distinct. | `met` | Enemy, miniboss, and boss surfaces are differentiated. | `src/assets/supplemental-art-sources.ts`, `app/battle.tsx` |
| Hit feedback is satisfying and clear. | `partial` | Audio and haptics help, but the full tactile action-loop requirement is not satisfied. | `src/audio/ui-sfx.ts`, `src/haptics/ui-haptics.ts`, `src/components/game-button.tsx` |

### 24.2 Session and Flow

| Requirement | Status | Notes | Key refs |
| --- | --- | --- | --- |
| Player can complete meaningful progress in a short session. | `met` | Route resolution, rewards, progression, and save/resume all support short sessions. | `app/run-map.tsx`, `app/reward.tsx`, `app/progression.tsx`, `src/save/runRepo.ts` |
| Death-to-retry flow is fast. | `met` | Post-run is immediate and restart/resume paths are short. | `app/end-run.tsx`, `app/index.tsx`, `src/state/runStore.ts` |
| Repeated runs do not feel identical. | `partial` | Classes, companions, routes, rewards, events, and authored flavor add variety, but content breadth is still limited. | `app/class-select.tsx`, `app/companion-select.tsx`, `app/run-map.tsx`, `app/event.tsx`, `app/reward.tsx` |
| Floor structure provides closure and escalation. | `met` | Floors, route choice, bosses, and archive/end-run flow provide that shape. | `app/run-map.tsx`, `app/battle.tsx`, `app/end-run.tsx` |

### 24.3 UX and HUD

| Requirement | Status | Notes | Key refs |
| --- | --- | --- | --- |
| HUD prioritizes survival info over meta info. | `met` | Run-map, battle, reward, and event screens keep immediate decisions above archive/meta content. | `app/run-map.tsx`, `app/battle.tsx`, `app/reward.tsx`, `app/event.tsx` |
| Menus do not bury `Play.` | `met` | The title screen foregrounds start/resume clearly. | `app/index.tsx` |
| Premium actions have appropriate confirmation. | `not yet` | No premium systems exist yet. | `n/a` |
| Routine actions are not over-confirmed. | `met` | Only destructive actions like save deletion and abandon confirmation are guarded. | `app/settings.tsx`, `app/run-map.tsx` |

### 24.4 Accessibility

| Requirement | Status | Notes | Key refs |
| --- | --- | --- | --- |
| Text can scale. | `met` | OS-aware font scaling and app text-size controls are implemented. | `app/_layout.tsx`, `src/theme/app-theme.ts`, `app/settings.tsx` |
| Important info is not color-only. | `met` | Labels, headings, badges, and descriptive copy reinforce state changes and room types. | `app/run-map.tsx`, `app/battle.tsx`, `app/reward.tsx`, `app/event.tsx` |
| Important info is not audio-only. | `met` | UI cues reinforce already-visible state instead of replacing it. | `app/settings.tsx`, `src/audio/ui-sfx.ts`, `app/run-map.tsx`, `app/reward.tsx` |
| Controls are adjustable/remappable where feasible. | `partial` | Combat action order, handedness bias, and controller-style hint mapping now exist, but hardware controller input and full global remapping do not. | `app/settings.tsx`, `src/input/combat-input.ts`, `app/battle.tsx` |
| Reduced motion/effects options exist. | `met` | System-aware reduced motion and app-level reduced motion are implemented. | `app/_layout.tsx`, `src/state/systemAccessibilityStore.ts`, `app/settings.tsx` |
| Subtitles/captions are supported where relevant. | `partial` | Important information is delivered as text in the current game, but there is no full subtitles/captions system for future voiced content. | `app/event.tsx`, `app/battle.tsx`, `app/onboarding.tsx` |
| Haptics can be disabled. | `met` | Haptics are fully toggleable. | `app/settings.tsx`, `src/haptics/ui-haptics.ts`, `src/types/profile.ts` |

### 24.5 Onboarding

| Requirement | Status | Notes | Key refs |
| --- | --- | --- | --- |
| Tutorial is interactive. | `met` | The first-session FTUE now uses guided choice steps instead of only static text. | `app/onboarding.tsx`, `src/content/onboarding.ts` |
| Tutorial is not overloaded. | `met` | The tutorial is scoped to a short five-step simulation plus carry-forward. | `app/onboarding.tsx`, `src/content/onboarding.ts` |
| Tutorial can be skipped/replayed. | `met` | Replay entry points exist from settings and codex, and the packet remains available. | `app/settings.tsx`, `app/codex.tsx`, `app/onboarding.tsx` |
| Player gets an early meaningful reward. | `partial` | The tutorial includes a reward-choice lesson, but it is still a simulation rather than a real persistent reward. | `app/onboarding.tsx`, `src/content/onboarding.ts` |
| Player understands permanent progression after first session. | `met` | The tutorial ends on carry-forward and the home/progression flow now exposes a next-goal summary. | `app/onboarding.tsx`, `src/progression/next-goal.ts`, `app/index.tsx`, `app/progression.tsx` |

### 24.6 Progression

| Requirement | Status | Notes | Key refs |
| --- | --- | --- | --- |
| There is always a visible next goal. | `met` | Next-goal summaries are visible on home, hub, and progression. | `src/progression/next-goal.ts`, `app/index.tsx`, `app/hub.tsx`, `app/progression.tsx` |
| Failed runs still contribute to progress. | `met` | Archive, stats, codex discoveries, and progression surfaces persist across failure. | `src/state/runStore.ts`, `app/end-run.tsx`, `src/save/profileRepo.ts` |
| Upgrade choices are strategically distinct. | `partial` | Reward choices and meta offers are distinct, but the broader build space is still limited. | `app/reward.tsx`, `src/engine/meta/meta-upgrade-engine.ts` |
| Long goals are decomposed into sub-goals. | `partial` | Next-goal surfacing now includes explicit post-win ladders, but richer quest/subgoal decomposition is not yet built. | `src/progression/next-goal.ts`, `app/progression.tsx`, `docs/launch-postlaunch-retention-plan.md` |

### 24.7 Monetization

| Requirement | Status | Notes | Key refs |
| --- | --- | --- | --- |
| Monetization does not interrupt core combat flow. | `not yet` | Monetization is not implemented. | `n/a` |
| Rewarded ads are optional. | `not yet` | Ads are not implemented. | `n/a` |
| Pricing and random-item disclosures are clear. | `not yet` | Purchases are not implemented. | `n/a` |
| Early purchase surfacing is not overly aggressive. | `not yet` | Purchases are not implemented. | `n/a` |
| Spenders do not trivially invalidate skill. | `not yet` | Purchases are not implemented. | `n/a` |

### 24.8 Live-Ops

| Requirement | Status | Notes | Key refs |
| --- | --- | --- | --- |
| Event UI does not overcrowd the home screen. | `met` | The home screen is not overloaded with live-event clutter. | `app/index.tsx` |
| Events reinforce core loop. | `partial` | Run events reinforce the current loop, but live-ops events are not implemented. | `app/event.tsx`, `src/content/events.ts` |
| Event rewards feel meaningful. | `partial` | Current event outcomes are meaningful for the run, but broader event-program reward tuning is still limited. | `app/event.tsx`, `src/engine/event/event-engine.ts` |
| New players can understand live content. | `not yet` | Live content systems are not implemented yet. | `n/a` |

### 24.9 Technical

| Requirement | Status | Notes | Key refs |
| --- | --- | --- | --- |
| Performance is stable on target devices. | `partial` | Responsive layout and careful UI structure exist, but device-wide perf validation is still outstanding. | `src/hooks/use-responsive-layout.ts`, `app/*` |
| Loads are acceptably short. | `partial` | The app feels light in current flows, but there is no formal load-time benchmark or device matrix. | `app/index.tsx`, `src/save/*` |
| Resume/save is reliable. | `met` | Active save, backup save, resume, and archive paths are all present. | `src/save/runRepo.ts`, `src/state/runStore.ts`, `app/index.tsx` |
| Analytics instrumentation is present and validated. | `partial` | Schema and client are present, key events are wired, and remote validation probes can now be sent from the dev smoke screen, but the launch monitoring stance still needs to be finalized and proven end to end. | `src/analytics/schema.ts`, `src/analytics/client.ts`, `src/analytics/http-adapter.ts`, `app/dev-smoke.tsx`, `app/onboarding.tsx`, `app/settings.tsx`, `src/state/runStore.ts`, `app/run-map.tsx`, `app/battle.tsx`, `app/reward.tsx`, `app/event.tsx`, `docs/launch-postlaunch-retention-plan.md` |

## Highest-Value Remaining Gaps

1. Input accessibility is improved, but hardware controller input and broader global remapping are still missing.
2. The spec's action-roguelite combat thesis is still only partially addressed: dodge/tempo and remapped action slots help, but the game remains fundamentally turn-based.
3. Analytics can now validate against a generic remote endpoint, but the launch monitoring stance still needs to be chosen and proven, whether that means verified production telemetry or an explicit low-data alternative.
4. Pacing, long-tail retention, and the premium-versus-free launch decision must be proven before release; the release gate is now documented in `docs/launch-postlaunch-retention-plan.md`.
5. Live-ops content now has a documented quarterly roadmap, but the actual systems remain unimplemented.
