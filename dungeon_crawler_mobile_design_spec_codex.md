# Mobile Dungeon Crawler Success Specification for Codex

Version: 1.1
Purpose: Provide a machine-readable product, design, UX, accessibility, retention, monetization, and technical specification for building a mobile-first dungeon crawler that is addictive, replayable, readable, accessible, and commercially viable without undermining trust.

Audience: Codex, engineers, designers, product managers, UX designers, artists, audio designers, QA, live-ops, and analytics.

Use this document as a binding implementation brief unless a conflicting product decision is explicitly documented.

Update focus for version 1.1: explicit win-state design, replayability after first clear, cross-class motivation, executive endgame structure, soft run-pressure systems, quarterly episodic content, and related analytics/commercial guardrails.

---

## 1. Product Goal

Build a **mobile-first action roguelite dungeon crawler** with:
- short, satisfying sessions,
- strong run-to-run variability,
- meaningful permanent progression,
- high readability on small screens,
- strong accessibility and player agency,
- a live-ops-friendly structure,
- monetization that supports retention rather than poisoning it.

The game should feel good within the first 30 seconds, teach itself within the first session, and still provide goals after the first week.

---

## 2. Success Criteria

The game should optimize for all of the following:

### 2.1 Player Experience
- Immediate clarity: player can identify danger, reward, and next action within ~1 second.
- Short-session viability: meaningful progress in brief sessions.
- Strong tactile feel: movement, attacks, dodges, hits, loot pickup, and leveling all feel responsive.
- Repeated novelty: each run feels distinct through room variation, enemy combinations, events, and build choices.
- Long-term motivation: players always have a clear next goal.

### 2.2 Product Health
- Good first-session retention.
- Strong day-1/day-7/day-30 retention foundations.
- Reliable conversion path without pay-to-win dominance.
- Live-ops extensibility: events, passes, modes, and rotating content can be added without redesigning the core.

### 2.3 Technical Quality
- Stable framerate on supported devices.
- Fast restart after death.
- Minimal downtime between attempt -> failure -> retry.
- Readable UI on phones of different sizes.
- Accessible defaults with deeper optional customization.

---

## 3. High-Level Product Thesis

The game should not be built as a pure console/PC dungeon crawler ported to phone.

It should instead be built as:
- a **mobile-native action roguelite**,
- focused on **positioning, timing, dodging, and build drafting**,
- with **assisted targeting or simplified input**,
- with **runs or meaningful run segments that fit snackable mobile sessions**,
- with a **persistent meta layer**,
- and with **live-ops, event, and social layers** designed from the beginning.

---

## 4. Non-Negotiable Product Pillars

### 4.1 Clarity Before Complexity
The player must understand:
- why they are there,
- the language and acronyms being used,
- why they fight,
- the consequences of losing,
- any backstory or context that helps decision making,
- all needed information must be provided before a decision or action is presented,
- what is dangerous,
- what is safe,
- what their abilities do,
- what reward they are choosing,
- what progress they made,
without hunting through clutter.

### 4.2 Agency Without Friction
The player must make meaningful choices, but the game must not slow them down with avoidable friction.

### 4.3 Short-Term Fun + Long-Term Goals
A run must be enjoyable on its own. The meta must make returning tomorrow feel worthwhile.

### 4.4 Accessibility Is Core Design
Accessibility is not optional polish. Readability, input flexibility, text sizing, color independence, subtitles, haptics controls, and motion reduction are core requirements.

### 4.5 Monetization Must Preserve Trust
Monetization must not make players feel cheated, trapped, or outclassed by spenders.

### 4.6 Live-Ops Ready Architecture
Content systems, currencies, item definitions, events, enemy data, room definitions, and UI surfacing should be data-driven wherever practical.

---

## 5. Core Loop Architecture

Implement nested loops. Do not rely on a single good combat loop.

### 5.1 Micro Loop (5-30 seconds)
Sequence:
1. Move / position.
2. Attack or trigger ability.
3. Dodge / avoid hazard.
4. Defeat enemy or survive wave.
5. Receive immediate feedback (VFX, sound, hit pause, currency/xp/loot).
6. Make or anticipate next action.

Requirements:
- Inputs must feel responsive.
- Telegraphs must be readable.
- Loot or XP reward must land quickly after success.
- The player must rarely be uncertain why they took damage.

### 5.2 Room / Encounter Loop (30-90 seconds)
Sequence:
1. Enter room.
2. Read threats.
3. Execute strategy.
4. Resolve combat.
5. Collect rewards.
6. Transition to next node/room/choice.

Requirements:
- Room goals must be obvious.
- Reward cadence must be frequent.
- Encounter composition must create variation without confusion.

### 5.3 Floor Loop (~2-4 minutes recommended)
Sequence:
1. Progress through several rooms/nodes.
2. Make at least one meaningful build choice.
3. Experience one escalation beat.
4. Reach boss / elite / special reward / exit.

Requirements:
- Each floor should feel like a complete episode.
- The floor must not be so long that players feel trapped if interrupted.
- Include optional risk/reward branches when possible.

### 5.4 Run Loop (~5-9 minutes target for a meaningful session)
Sequence:
1. Start run.
2. Survive and build power.
3. Make build-defining choices.
4. Reach climax (boss/extract/death).
5. Convert run into permanent progress.

Requirements:
- Runs may be longer than 5-9 minutes only if they contain clear checkpoints, suspension points, or fast resumability.
- Death must be meaningful but not demoralizing.
- Post-run progression must be visible immediately.

### 5.5 Meta Loop (daily to weekly)
Examples:
- talent tree,
- character unlocks,
- weapon unlocks,
- relic collections,
- home base upgrades,
- crafting,
- event currency accumulation,
- daily/weekly quests.

Requirements:
- Always present a visible next goal.
- Break long goals into smaller sub-goals.
- Time spent should always feel like progress, even after a failed run.

### 5.6 Seasonal / Live-Ops Loop (multi-week)
Examples:
- battle pass,
- themed events,
- rotating mutators,
- seasonal bosses,
- limited cosmetics,
- leaderboards,
- clan goals.

Requirements:
- Live-ops must reinforce the core gameplay loop rather than distract from it.
- Event content should reuse core systems efficiently.
- Rotations must create freshness without invalidating existing progression.

### 5.7 Campaign / Mastery Loop (multi-session, account-level)
Sequence:
1. Achieve a first meaningful clear with one class.
2. Unlock a new class, route, modifier tier, or narrative branch immediately.
3. Re-enter with fresh asymmetry rather than repeating the exact same solved path.
4. Build toward an account-level mastery state that requires more than one class or route.
5. Use mastery completion to unlock a new inversion mode, higher mandate tier, or quarterly content bridge.

Requirements:
- The first meaningful clear must happen early enough that average players can believe the game respects their time.
- A single-class win must not exhaust the product's fantasy or its progression map.
- Account-level mastery should feel aspirational rather than mandatory for basic satisfaction.
- The post-win state must answer, on the same screen, â€œwhy play again right now?â€

---

## 6. Session Design and Pacing

### 6.1 Session Targets
Design for mobile usage patterns:
- meaningful progress in short sessions,
- easy interruption tolerance,
- fast relaunch and resume.

Recommended targets:
- one meaningful decision every 30-60 seconds,
- one punctuation beat every 2-3 minutes,
- one complete floor segment or checkpoint inside a short play session.

### 6.2 Restart Friction
Must minimize:
- long intro screens,
- long loads,
- excessive confirmation dialogs,
- unskippable narrative on repeat play,
- slow post-death flow.

### 6.3 Failure Design
Failure should:
- teach,
- preserve some value,
- show why it happened,
- point toward improvement,
- not require long dead time before the next attempt.

---

## 7. Combat Design Requirements

### 7.1 Mobile-First Controls
Prioritize:
- movement,
- dodge timing,
- positioning,
- simplified active ability usage,
- assisted targeting or forgiving aim,
- optional auto-fire / hold-to-attack / aim assist as appropriate.

Avoid building around:
- precision tiny-hitbox manual targeting,
- excessive simultaneous button demands,
- actions that require claw-grip or awkward thumb travel.

### 7.2 Combat Readability
Combat must allow players to instantly parse:
- enemy type,
- elite status,
- incoming area-of-effect zones,
- projectile origin,
- their own hurtbox / position,
- pickup value.

Rules:
- Telegraphs must contrast strongly with ground art.
- Enemy silhouettes must be recognizable.
- Status effects must not rely only on color.
- VFX must never hide critical gameplay information.

### 7.3 Build Variety
Each run must contain real build decisions:
- elemental synergies,
- attack modifiers,
- survivability tradeoffs,
- cooldown changes,
- crowd control options,
- risk/reward augments.

Do not ship a fake-choice system where one option is almost always optimal.

### 7.4 Reward Cadence
Combat should frequently produce:
- XP,
- loot,
- currency,
- relic choices,
- unlock progress,
- visible power spikes.

The player should feel stronger during a run, not just after it.

---

## 8. Floor Structure and Encounter Density

### 8.1 Recommended Floor Structure
Default guidance:
- 4-8 encounter nodes or equivalent room beats per floor,
- at least one notable variation beat per floor,
- boss / elite / event / reward room at meaningful intervals.

### 8.2 Encounter Variety
Encounter pool should include:
- standard combat rooms,
- elite rooms,
- miniboss or boss rooms,
- treasure rooms,
- shops,
- healing/safe rooms,
- event rooms,
- optional challenge rooms,
- branching route choices.

### 8.3 Density Rules
Avoid:
- too many weak rooms in a row,
- too many visually similar rooms back-to-back,
- rooms that overstay their tactical interest,
- empty traversal with no decisions.

### 8.4 Instance Count Guidance
Each floor should provide enough encounters to create escalation but not so many that the player loses a sense of closure.

Preferred pattern:
- open with clear simple threat,
- escalate through combination pressure,
- present at least one meaningful choice,
- end with a punctuation moment.

---

## 9. Information Hierarchy and HUD

During combat, the screen must prioritize information by **decision urgency**.

### 9.1 On-Screen Priority Order
1. Immediate survival information.
2. Immediate action-state information.
3. Room objective information.
4. Run progress information.
5. Meta / event / long-term information.

### 9.2 Immediate Survival Information
Must be the easiest to read:
- player position,
- enemy telegraphs,
- hazards,
- safe space,
- incoming projectiles,
- health / shield.

### 9.3 Immediate Action State
Should be visible but secondary to hazards:
- dodge cooldown,
- active skill cooldowns,
- ammo/mana if used,
- weapon state,
- charge states.

### 9.4 Room Objective
Examples:
- enemies remaining,
- miniboss status,
- objective marker,
- key pickup,
- exit marker.

### 9.5 Run Progress
Examples:
- floor number,
- room count,
- minimap,
- run currency,
- relic slots,
- active modifiers.

### 9.6 Meta / Live-Ops UI
Examples:
- quests,
- pass progress,
- event countdowns,
- collection progress.

Rules:
- Do not give meta UI equal visual weight to combat survival information.
- Surface meta at room transitions, post-room summaries, hub screens, and optional panels.
- Avoid persistent banner clutter during combat.

### 9.7 HUD Customization
Allow players to adjust where practical:
- button placement,
- opacity,
- scale,
- optional minimap visibility,
- simplified HUD mode.

---

## 10. UX Principles

### 10.1 Interaction Model
Use a predictable, low-friction interaction pattern:
- tap for direct actions,
- press-and-hold only when comfortable,
- swipe only where reliable,
- avoid gesture overload.

### 10.2 Menu Flow
The shortest path to gameplay must be short.

Required:
- quick entry to run,
- quick resume,
- quick retry,
- skippable repeated narrative,
- obvious access to progression and events.

### 10.3 Confirmation Logic
Use confirmations only for:
- premium currency spends,
- destructive actions,
- irreversible choices with major cost.

Do not over-confirm low-cost routine actions.

### 10.4 Cause and Effect
Player actions must produce clear response:
- visual feedback,
- audio feedback,
- haptic feedback where available,
- state change.

The game must not feel mushy or ambiguous.

---

## 11. Accessibility and Universal Design Requirements

Accessibility is a hard requirement.

### 11.1 Visual Accessibility
Must include:
- scalable text,
- scalable subtitle size,
- high-contrast options where needed,
- colorblind-safe design,
- important information not conveyed by color alone,
- reduced motion option,
- reduced effects option,
- readable default font sizing,
- optional UI scale adjustments.

### 11.2 Input Accessibility
Must include where feasible:
- remappable controls,
- adjustable button positions,
- aim assist or optional auto-aim,
- hold-to-attack / tap-to-attack options as appropriate,
- support for controller input,
- large touch targets,
- spacing between interactive controls.

### 11.3 Audio Accessibility
Must include:
- subtitles or captions for important speech and cues where practical,
- separate audio sliders,
- audio cues not as sole conveyors of required information,
- haptics toggle / intensity option if haptics are used,
- mono compatibility or non-spatial fallback for critical cues.

### 11.4 Cognitive Accessibility
Must include:
- simple and consistent terminology,
- clear instructions,
- replayable tutorials,
- objective markers or hinting when lost,
- ability to pause instructional text,
- progressive disclosure of complexity.

### 11.5 Accessibility Philosophy
Defaults should already be accessible enough for many users. Settings should extend accessibility, not rescue a bad baseline.

---

## 12. User Agency Requirements

### 12.1 Meaningful Choice
The player should repeatedly choose between options that are:
- understandable,
- distinct,
- strategically valid,
- relevant to current run state.

### 12.2 Pace Control
Allow players to:
- pause text,
- skip repeated story sequences,
- replay tutorials,
- inspect rewards before choosing,
- review item details,
- adjust settings mid-session where practical.

### 12.3 Recovery from Mistakes
Provide:
- easy menu exits,
- confirmation on high-cost choices,
- transparent UI for value and consequences,
- clear post-failure explanations.

Avoid trapping users in hidden irreversible mistakes.

### 12.4 Assistive Options vs Forced Automation
Optional assists are good. Forced removal of player control is bad unless central to the fantasy and clearly communicated.

---

## 13. Tutorials and Onboarding

### 13.1 FTUE Principles
The first-time user experience must be:
- interactive,
- short,
- contextual,
- skippable for experienced players,
- replayable later.

### 13.2 First Session Teaching Order
Teach in this order unless a better tested order emerges:
1. Move.
2. Attack.
3. Avoid hazard / dodge.
4. Collect reward.
5. Choose upgrade.
6. Fight a simple boss or elite.
7. Experience loss or extraction.
8. Understand permanent progress.

### 13.3 Tutorial Restrictions
Avoid:
- giant text walls,
- teaching too many systems at once,
- lore-heavy opening explanations,
- hiding the fun until after the tutorial.

### 13.4 Contextual Help
Include:
- on-demand glossary,
- tooltips,
- reminder prompts,
- icon explanations,
- first-time overlays for new systems.

### 13.5 Early Rewarding
The player must get at least one satisfying early power or unlock quickly.
The first session must prove the game gets better, not merely harder.

---

## 14. Language, Copy, and Terminology

### 14.1 Language Rules
Write interface and tutorial text using:
- short sentences,
- direct verbs,
- concrete language,
- consistent terminology.

### 14.2 Naming Rules
For each system, use one stable name.
Example:
- choose either â€œRelicâ€ or â€œBlessingâ€ or â€œAugment,â€ not all three for the same concept.

### 14.3 Gameplay Copy Style
Preferred:
- â€œDodge the blast.â€
- â€œChoose one relic.â€
- â€œElite enemy incoming.â€
- â€œBreak shield to stun.â€

Avoid:
- vague flavor-first instructions,
- overly ornate fantasy text in critical UX,
- inconsistent labels across menus.

### 14.4 Localization Readiness
UI must be built so text can expand safely.
Do not hard-code spacing that breaks in other languages.
Avoid embedding text in art when possible.

---

## 15. Graphics and Art Direction Requirements

### 15.1 Readability First
Art style must preserve:
- silhouette clarity,
- foreground/background separation,
- telegraph visibility,
- pickup recognition,
- boss readability,
- safe-space legibility.

### 15.2 Effects Budget
VFX may enhance impact but must never obscure:
- hitboxes,
- projectiles,
- telegraphs,
- pickups,
- player position.

### 15.3 Environment Design
Environment art must support gameplay, not compete with it.
Backgrounds should not visually drown combat information.

### 15.4 Motion Sensitivity
Provide options for:
- reduced motion,
- reduced camera shake,
- reduced screen flash,
- reduced particle intensity.

### 15.5 Asset Rules
Enemy classes should be distinguishable at a glance by:
- silhouette,
- animation profile,
- weapon/readiness posture,
- complementary audio cue.

---

## 16. Audio and Haptics Requirements

### 16.1 Audio Roles
Audio must support:
- readability,
- combat feedback,
- reward feel,
- atmosphere,
- pacing.

### 16.2 Critical Cue Rules
Danger, reward, and state-change sounds must be distinct.
Avoid mixing them into the same frequency band or same emotional tone.

### 16.3 Audio Mix Requirements
Must include separate sliders for:
- master,
- music,
- SFX,
- voice,
- ambient.

### 16.4 Audio Accessibility
Required principles:
- no essential information from sound alone,
- provide subtitle/caption support where relevant,
- important sounds may also trigger haptic or visual reinforcement.

### 16.5 Haptics
Use haptics to reinforce:
- hit confirmation,
- damage taken,
- dodge success,
- rare reward moments,
- UI confirmations.

Provide:
- haptics on/off,
- optional intensity control where possible.

---

## 17. Progression Design Requirements

### 17.1 Run Progression
Within a run, players must gain:
- new powers,
- synergies,
- stats,
- resource options,
- survivability or mobility changes.

### 17.2 Meta Progression
Between runs, players must progress through systems like:
- talent tree,
- class unlocks,
- loadout unlocks,
- crafting,
- collectible relic library,
- cosmetics,
- home base upgrades,
- event track.

### 17.3 Goal Structure
Every long goal should be decomposed into sub-goals.
Players must not feel they are grinding into a fog.

### 17.4 Post-Run Screen
Always summarize:
- what the player achieved,
- what they unlocked,
- what they earned,
- what they can work toward next.

### 17.5 Collection Systems
Collection systems are allowed and useful when they:
- create long-term completion desire,
- support cosmetics or meta progression,
- do not create unfair in-run dominance,
- are understandable and browseable.

### 17.6 Win Condition Architecture
The product must define at least three victory layers rather than one flat ending:

1. **First meaningful victory**: a short-horizon clear that teaches the structure and proves the game can be beaten.
2. **Primary campaign victory**: the first full class clear that most players will interpret as â€œI won.â€
3. **Account-level mastery victory**: a broader meta goal that unlocks the strongest post-win continuation loop.

Recommended targets:
- first meaningful victory within the first 30-60 minutes of cumulative play,
- first full class clear within roughly 2-4 cumulative hours for an average motivated player,
- account-level mastery after multiple classes/routes across roughly 10-20+ cumulative hours.

These are design targets, not promises. Tune around them using telemetry. A first clear that arrives too late will suppress retention. A first clear that arrives too early without new unlocks will accelerate uninstall behavior.

### 17.7 Replayability After First Clear
A first clear must unlock something that changes future runs immediately and visibly. Acceptable post-win unlocks include:
- a new class with different resource logic,
- a new faction or route,
- a mandate tier with remixed mutators,
- a new crisis deck or room/event pool,
- a persistent narrative branch,
- access to a higher-order metagame such as board politics or executive decisions.

The post-win screen must never end at â€œcredits, then reset.â€ It should present at least one high-clarity continuation CTA such as:
- play the newly unlocked class,
- continue this class on a harder mandate,
- enter an executive inversion run after meeting account-level criteria,
- carry a quarterly code/token into the next update or event.

### 17.8 Cross-Class Motivation
Each class must justify its existence with more than stat changes. A player who has already cleared one class should care about another class because it offers:
- a distinct control fantasy,
- a distinct build grammar,
- different strategic shortcuts and vulnerabilities,
- different class-specific event resolutions,
- different narrative intel or endings,
- access to mastery rewards that cannot be earned by repeating one solved class forever.

Guidance:
- shared meta progression may reduce friction, but it must not flatten class identity,
- each class should have at least one unique mechanic that changes room decision-making,
- at least some bosses, contracts, endings, or relic synergies should feel meaningfully different per class.

### 17.9 Recommended Corporate Victory Structure
For a corporate-satire crawler, a strong default structure is:
- **Class clear**: survive the current quarter stack and beat the end-of-quarter executive or board encounter,
- **Campaign clear**: complete the Q1-Q4 arc for that class and resolve the department's fate,
- **Total victory**: unlock and complete the overthrow/reform/corrupt route at the account level after meeting multi-class criteria.

This structure supports both short-term closure and long-term aspiration. It also maps cleanly to live content and makes it easy to tease upcoming quarter updates.

### 17.10 Executive Endgame / Inversion Mode
After the player earns a true account-level victory, it is appropriate to unlock an â€œexecutiveâ€ mode or equivalent inversion fantasy where the player now occupies the seat of the person making bad strategic decisions.

Rules for this mode:
- it should be unlocked only after a meaningful total-win condition,
- it should remix existing systems rather than requiring a fully separate game,
- it should expose different tradeoffs such as budget extraction vs employee stability, short-term metrics vs long-term collapse, or public image vs internal dysfunction,
- it should deepen satire and replayability rather than replace the main game.

This is a strong answer to â€œwhy keep playing after I already won?â€ because it transforms victory into a new lens on the same system.

### 17.11 Run Gating and Performance Review Pressure
Do **not** hard-delete core meta progress for ordinary failure. In most products, punitive deletion of account progress after the player has already invested time will harm trust more than it improves retention.

Preferred approach:
- use **soft pressure** inside runs or seasons,
- frame it as probation, quarterly review, mandate pressure, or contract expiry,
- let failure cost bonus rewards, route access, streak bonuses, or prestige progress,
- preserve core unlocks, collections, and fundamental meta identity.

Acceptable hard-reset usage:
- opt-in ironman contracts,
- challenge ladders,
- special seasonal variants with explicit warning and separate rewards.

The base product should not feel like the company is deleting the player's personnel file every time they miss a promotion.

---

## 18. Economy and Monetization Guardrails

### 18.1 Monetization Priority Order
Preferred revenue stack:
1. cosmetics,
2. battle/event pass,
3. convenience,
4. non-predatory progression support,
5. rewarded ads for specific optional use cases.

### 18.2 Monetization Principles
Must:
- preserve trust,
- avoid making failure feel engineered,
- avoid invalidating skill,
- avoid obvious pay-to-win dominance,
- communicate prices and odds transparently where applicable,
- keep first-purchase moments contextually appropriate.

### 18.3 Rewarded Ads
If used, they should be:
- optional,
- clearly labeled,
- additive rather than mandatory,
- not inserted into core combat flow.

Good uses:
- extra revive,
- bonus chest,
- bonus currency,
- reroll,
- daily utility.

Avoid:
- ads that interrupt combat,
- ads required to maintain basic fun,
- excessive ad pressure early.

### 18.4 Loot Box / Random Purchase Caution
If random purchases exist:
- disclose clearly,
- present odds where required,
- comply with store/platform/regional rules,
- avoid misleading generic disclosures.

### 18.5 Spend Safeguards
Require confirmation for premium currency expenditures and expensive irreversible purchases.

### 18.6 Time-Limited Codes, Quarterly Tokens, and FOMO Boundaries
If wins generate a code, token, or carry-forward bonus for the next quarterly update, the reward should be:
- exciting,
- easy to understand,
- recoverable later in some form,
- non-essential to core power balance.

Good uses:
- cosmetic unlock tracks,
- optional starting mutators,
- narrative memos or intel,
- side-path access,
- event convenience.

Bad uses:
- irreplaceable power spikes that future players can never obtain,
- required items for the main progression path,
- opaque codes that feel like external homework.

Quarterly continuity should create anticipation, not resentment.

---

## 19. Social and Live-Ops Systems

### 19.1 Social Features
Strong candidates:
- asynchronous leaderboards,
- clans/guilds,
- co-op,
- friend assist systems,
- shared event goals,
- seasonal ranking ladders.

### 19.2 Live-Ops Principles
Events should:
- reuse core gameplay,
- be understandable,
- offer fresh modifiers,
- create aspirational rewards,
- avoid excessive fragmentation,
- not bury new players in parallel systems.

### 19.3 Event Content Types
Possible implementations:
- rotating mutators,
- special dungeon tilesets,
- limited bosses,
- event quests,
- score attack,
- survival gauntlet,
- relic draft variants,
- community milestones.

### 19.4 Event UI
Do not over-clutter the home screen.
Surface urgent live content clearly, but do not drown core actions in banners.

### 19.5 Episodic / Quarterly Content Structure
A corporate dungeon crawler should strongly consider a Q1-Q4 episodic structure. Each quarterly content beat should ideally ship with a compact package such as:
- one new crisis chain or modifier set,
- one new boss or executive directive,
- one new room/event pack,
- one cosmetic reward lane,
- one cross-class challenge or mastery objective,
- one clear tease for the next quarter.

This structure gives live-ops a visible calendar without forcing players to relearn the game every update.

### 19.6 Forward Teasing and Post-Win Hooks
The game should tell players what is coming next before they leave. Good examples:
- a next-quarter teaser on the win screen,
- a visible locked route unlocked by another class,
- a board memo that references the next seasonal crisis,
- a token/code/banner that clearly says where it matters next.

The player should exit a win state with one clear next objective already installed in their head.

---

## 20. Technical Requirements

### 20.1 Performance
Must prioritize:
- stable frame pacing,
- responsive input,
- efficient VFX,
- low hitching during enemy spawns and boss attacks,
- fast loads,
- fast death-to-retry loop.

### 20.2 Scalability
Need scalable systems for:
- content definitions,
- balance tuning,
- event configuration,
- localization,
- UI scaling,
- analytics instrumentation,
- remote balance changes where feasible.

### 20.3 Save/Resume
Must support:
- reliable persistence,
- crash recovery safeguards,
- resume from interruption where appropriate,
- data integrity for progression and purchases.

### 20.4 Device Constraints
Design for:
- small screens,
- varied performance classes,
- touch-first usage,
- bright/noisy environments,
- one-handed or distracted play contexts.

---

## 21. Analytics and Experimentation

Instrument the game so product teams can answer:
- Where do players fail in FTUE?
- What upgrades are selected most/least often?
- Which choices are fake choices because they are never picked?
- Which rooms cause frustration spikes?
- Where do players churn in the first session?
- How fast do players reach first meaningful unlock?
- How fast do they reach first purchase opportunity?
- Which event types improve retention without harming satisfaction?

### 21.1 Required Event Instrumentation
Track at minimum:
- install / first open,
- tutorial step completion,
- room entry / exit,
- cause of death,
- upgrade presented / chosen,
- boss reached / defeated,
- run duration,
- meta screen visits,
- currency earn/spend,
- settings changes,
- accessibility feature usage,
- ad exposure / opt-in / reward claim,
- purchase funnel events,
- event participation.

### 21.2 Testing Policy
A/B test carefully:
- FTUE overlays,
- reward cadence,
- room density,
- upgrade choice presentation,
- revive offers,
- event surfacing,
- pass positioning,
- ad timing.

Do not test changes that fundamentally confuse the player without guardrails.

### 21.3 Replayability and Post-Win Analytics
Instrument the systems that answer whether victory creates retention or churn. Track at minimum:
- first meaningful victory reached,
- first full class clear reached,
- next action after win screen,
- class selected after first clear,
- percent of players who start another run within the same session after winning,
- percent of players who try a second class within 24 hours / 7 days of first clear,
- executive mode unlock and entry rate,
- probation / pressure system failure rate,
- quarterly teaser click-through or follow-through,
- uninstall or inactivity risk signals after first clear.

The product team must know whether the win state creates momentum or acts as a polite exit ramp.

---

## 22. What to Avoid

### 22.1 Core Design Pitfalls
Avoid:
- long low-value tutorials,
- fake build choices,
- unreadable telegraphs,
- over-busy VFX,
- tiny touch targets,
- too many combat buttons,
- unclear damage sources,
- long floor slogs,
- poor restart flow,
- failure with no compensating progress,
- bloated home screen UI.

### 22.2 UX Pitfalls
Avoid:
- mixing multiple names for the same system,
- hiding key information in tiny text,
- placing monetization buttons where they invite accidental taps,
- surfacing meta notifications during intense combat,
- unskippable repeat cutscenes.

### 22.3 Accessibility Pitfalls
Avoid:
- relying on color alone,
- relying on sound alone,
- unscalable text,
- forced motion/shake/flash,
- rigid control placement,
- inaccessible default fonts or contrast.

### 22.4 Monetization Pitfalls
Avoid:
- intrusive interstitials in core flow,
- obvious pay-to-win,
- monetizing basic relief from frustration the game itself creates,
- unclear pricing or misleading purchase descriptions,
- overloading early users with store prompts.

### 22.5 Live-Ops Pitfalls
Avoid:
- event overload,
- too many disconnected currencies,
- overly complex pass structures,
- systems that make newcomers feel permanently behind.

---

## 23. Implementation Priority Order

### Phase 1: Core Feel Prototype
Build first:
- movement,
- attack loop,
- dodge / invulnerability logic if used,
- enemy telegraphs,
- hit feedback,
- basic room flow,
- death/retry flow,
- one simple HUD.

Success test:
- prototype is fun with placeholder art.

### Phase 2: Run Structure Prototype
Add:
- several room types,
- floor progression,
- boss encounter,
- reward selection,
- run-end summary,
- basic permanent currency carryover.

Success test:
- several repeat plays feel meaningfully different.

### Phase 3: Meta Progression and FTUE
Add:
- first-session tutorial flow,
- one meta progression system,
- unlocks,
- home/base or meta hub,
- settings and accessibility baseline.

Success test:
- new players understand the game quickly and see a reason to return.

### Phase 4: Content Breadth + Live-Ops Foundation
Add:
- more enemies,
- more item/relic pools,
- more floors/themes,
- economy tuning,
- social/light live-ops infrastructure,
- event support,
- analytics.

Success test:
- game has repeatable medium-term retention hooks.

### Phase 5: Monetization + Polish
Add carefully:
- cosmetics,
- pass system,
- optional rewarded ads,
- store UX,
- progression bundles if any,
- further accessibility options,
- localization hardening.

Success test:
- monetization feels additive, not corrosive.

---

## 24. Acceptance Checklist

Use this as a release gate.

### 24.1 Combat and Readability
- [ ] Player can identify hazards immediately.
- [ ] Player can tell why damage was taken.
- [ ] Telegraphs remain visible during heavy VFX.
- [ ] Enemy roles are visually distinct.
- [ ] Hit feedback is satisfying and clear.

### 24.2 Session and Flow
- [ ] Player can complete meaningful progress in a short session.
- [ ] Death-to-retry flow is fast.
- [ ] Repeated runs do not feel identical.
- [ ] Floor structure provides closure and escalation.

### 24.3 UX and HUD
- [ ] HUD prioritizes survival info over meta info.
- [ ] Menus do not bury â€œPlay.â€
- [ ] Premium actions have appropriate confirmation.
- [ ] Routine actions are not over-confirmed.

### 24.4 Accessibility
- [ ] Text can scale.
- [ ] Important info is not color-only.
- [ ] Important info is not audio-only.
- [ ] Controls are adjustable/remappable where feasible.
- [ ] Reduced motion/effects options exist.
- [ ] Subtitles/captions are supported where relevant.
- [ ] Haptics can be disabled.

### 24.5 Onboarding
- [ ] Tutorial is interactive.
- [ ] Tutorial is not overloaded.
- [ ] Tutorial can be skipped/replayed.
- [ ] Player gets an early meaningful reward.
- [ ] Player understands permanent progression after first session.

### 24.6 Progression
- [ ] There is always a visible next goal.
- [ ] Failed runs still contribute to progress.
- [ ] Upgrade choices are strategically distinct.
- [ ] Long goals are decomposed into sub-goals.

### 24.7 Monetization
- [ ] Monetization does not interrupt core combat flow.
- [ ] Rewarded ads are optional.
- [ ] Pricing and random-item disclosures are clear.
- [ ] Early purchase surfacing is not overly aggressive.
- [ ] Spenders do not trivially invalidate skill.

### 24.8 Live-Ops
- [ ] Event UI does not overcrowd the home screen.
- [ ] Events reinforce core loop.
- [ ] Event rewards feel meaningful.
- [ ] New players can understand live content.

### 24.9 Technical
- [ ] Performance is stable on target devices.
- [ ] Loads are acceptably short.
- [ ] Resume/save is reliable.
- [ ] Analytics instrumentation is present and validated.

### 24.10 Retention and Replay
- [ ] First meaningful victory happens early enough to feel attainable.
- [ ] First full class clear unlocks a visibly different next step.
- [ ] At least one additional class or route feels meaningfully distinct.
- [ ] Base failure does not hard-delete core account progress.
- [ ] Win-state rewards create anticipation for future content without creating unfair FOMO.
- [ ] Executive/inversion mode is gated behind mastery, not dumped into FTUE.

---

## 25. Red-Flag Review Questions

If the answer to any of these is â€œyes,â€ rework is likely needed.

1. Is the game asking players to read too much before letting them have fun?
2. Can VFX or environment art hide danger zones or projectiles?
3. Are there too many combat buttons for a small phone screen?
4. Are players likely to die without understanding why?
5. Can a player complete a short satisfying play segment in a brief session?
6. Does the home screen feel like a billboard instead of a game?
7. Are premium prompts appearing before the player understands the value loop?
8. Are any essential instructions conveyed only by color or only by sound?
9. Are there systems with different names in different places?
10. Are most upgrade decisions actually solved rather than situational?
11. Is the game harder to parse in motion than in screenshots?
12. Does failure feel like lost time instead of partial progress?
13. Are events creating parallel chores instead of reinforcing the main loop?
14. Would the game still be fun with placeholder art and no monetization?
15. Does the first win feel like a finish line with no meaningful next step?
16. Can one class or build satisfy the whole product, making other classes feel optional in the bad way?
17. Would a punitive run-gating system make players feel the game is deleting effort instead of creating tension?

---

## 26. Codex Execution Instructions

When implementing features, Codex should follow these rules:

### 26.1 Engineering Rules
- Prefer data-driven definitions for rooms, enemies, items, events, and economy values.
- Keep systems modular so content can be tuned without heavy code changes.
- Expose UX/accessibility values in configuration where practical.
- Separate presentation logic from gameplay logic.
- Instrument every major player decision and failure point.

### 26.2 UI Rules
- Keep combat HUD minimal and priority-ordered.
- Build support for UI scaling and dynamic text early.
- Ensure text expansion for localization.
- Avoid baking critical text into images.

### 26.3 Gameplay Rules
- Tune for mobile readability first.
- Favor fewer, clearer abilities over many muddy ones.
- Ensure each run offers distinct choices.
- Ensure post-run progress is visible every time.

### 26.4 Content Rules
- Add variety through combinations and modifiers, not just raw quantity.
- Keep encounter pools readable and categorized.
- Design each new system to plug into live-ops later if appropriate.

### 26.5 QA Rules
- Test on small screens, low/medium/high device tiers, noisy environments, and short interrupted sessions.
- Test with reduced motion, no haptics, low audio, and large text.
- Test one-handed play and controller play where supported.
- Test tutorial skip/replay and recovery from mistaken taps.

---

## 27. Suggested MVP Scope

A sensible first shippable version should include:
- 1 core hero/class,
- 1-2 alternative starting weapons or loadouts,
- 3-4 enemy archetypes,
- 1 elite set,
- 1 boss,
- 1 tileset/theme,
- 1 run-upgrade pool,
- 1 simple permanent progression system,
- 1 explicit first-victory unlock that points to the second play session,
- basic accessibility settings,
- tutorial,
- post-run summary,
- analytics,
- optional rewarded ad support only if it does not distort the prototype.

Do not try to ship the full long-term system map before the core loop is proven.

---

## 28. Suggested Version 1 Scope

Version 1 should likely include:
- multiple heroes or archetypes,
- broader relic/upgrade pool,
- multiple floor themes,
- more bosses,
- stronger meta layer,
- event support,
- cosmetics,
- at least one social/light competitive feature,
- polished store/pass UX if monetization is live,
- full accessibility menu,
- localization readiness.

---

## 29. Research Basis and Reference Topics

This specification synthesizes prior research across:
- mobile midcore retention and live-ops patterns,
- action roguelite / roguelike design patterns,
- mobile session design benchmarks,
- combat readability guidance,
- Apple and Material design principles,
- accessibility guidance from AbleGamers, Game Accessibility Guidelines, Microsoft/Xbox accessibility guidance, and related design standards,
- monetization and disclosure considerations for modern mobile games.

If a future iteration needs a stricter traceable research appendix, add a formal bibliography mapping each requirement to a source.

---


### 29.1 2026 Research Update for This Revision
The following external considerations informed the version 1.1 update:
- current Expo guidance on when to use development builds instead of Expo Go,
- current Expo guidance on EAS Build, notifications, haptics, audio, GL rendering, native modules, and in-app purchases,
- current Apple App Review and App Store Connect guidance related to randomized purchases / loot boxes and age ratings,
- current Google Play guidance on Data safety disclosures, including third-party SDK responsibility,
- current Game Accessibility Guidelines emphasis on remapping, text size, color independence, subtitles, readable text, interactive tutorials, and low-friction startup.

If a future version of this brief becomes an external-facing production spec, add a formal bibliography with direct links and last-checked dates.

## 30. Final Product Standard

The intended final experience is:
- instantly readable,
- satisfying in seconds,
- replayable for weeks,
- expandable for months,
- accessible by default,
- respectful of player time,
- commercially sustainable,
- unmistakably designed for phone rather than adapted to it.
