# Launch / Post-Launch Retention Plan

Version date: April 8, 2026
Owner intent: pacing and long-tail retention must be fully tuned before public release. If the game cannot clearly justify a premium `US$3.99` launch through replay value, the launch path must be revisited in favor of a free route with optional paid upgrades, future games, or extras.

## 1. Release gate

Do not let the game go live until all of the following are true:

- The average player can understand the baseline win condition, the total win condition, and why another run matters immediately after a clear.
- The run pacing feels deliberate rather than padded, with enough novelty and post-run pull to support a premium ask.
- The first-win aftermath no longer ends on vague archive-only motivation. The player must leave the recap with an explicit next ladder.
- The premium `US$3.99` route still feels honest after outside testing. If it does not, revisit a free route with optional paid upgrades, future games, or extras instead of shipping a weak premium proposition.

## 1.1 First-impression and viability gates

The release gate is not only about retention. The game also needs to survive first contact as a viable Expo product.

Do not go live until all of the following are true:

- A new player can understand what the game is, what the first useful action is, and what the next goal is within the first session without outside explanation.
- A guided task tester can install the release build, finish the opening flow, complete or archive a run, and explain why they would play again right after the recap.
- The hardest important path for this product shape is proven on real hardware: title -> onboarding -> class select -> companion select -> run map -> battle -> reward/event -> archive recap -> progression.
- The release build contains no fake settings, no misleading permissions, no placeholder support/privacy/store copy, and no store assets that over-promise the actual loop.
- Distribution is not left to wishful thinking. The first 10 to 50 outside testers or buyers, and how they will hear about the game, should already be named credibly before launch.
- Measurement is honest. Either a privacy-safe production analytics/crash path is live and verified, or the project has an explicit no-production-telemetry launch plan backed by strong guided testing, beta feedback, and manual release evidence.
- The exact release artifact, source commit, and environment assumptions are recorded so a successful tester build can be traced back to the source that produced it.

## 1.2 Launch-commercial decision rule

Before public release, decide the launch business model using evidence instead of hope.

- Ship premium at `US$3.99` only if the average first session feels polished, the replay hook is obvious after the first clear, and outside testing supports the price.
- If first-session delight, replay motivation, or value-for-price still feel soft, revisit a free route with optional paid upgrades, future games, or extras instead of forcing a weak premium launch.
- Do not use grind, confusion, or punitive loss systems to manufacture premium value.

## 2. Win structure and timing targets

### 2.1 Canonical win structure

- Baseline win: clear floor 10 and survive the run.
- Truth win: clear floor 10 while meaningfully progressing the Everrise proof chain.
- Total win: collect all three proofs and choose `force-the-truth-to-surface` at `Root Access`, producing `full-exposure`.
- Incomplete but valid clears: `controlled-detonation`, `partial-exposure`, `licensed-survival`, and `quiet-survival` remain meaningful endings, not fake failures.

### 2.2 Launch pacing targets

These targets should be treated as release criteria, not nice-to-have aspirations.

- First archived run: within session 1.
- First baseline win: usually within 3 to 5 runs.
- First total win: usually within 6 to 10 runs.
- First-session time to understanding the long game: inside the first completed run recap.
- Mature run length after onboarding: roughly 12 to 18 minutes, unless save/resume and checkpoints make longer climbs feel harmless on mobile.

## 3. Post-win ladders

Replace the vague post-win archive framing with three explicit ladders that stay legible in UI, tuning, and content planning.

### 3.1 Truth ladder

Primary objective:

- Get all five ending states.
- Then get `full-exposure` with each class.

Why it works:

- The ending pack already supports distinct truth outcomes instead of a single binary win.
- The final `Root Access` choice already creates meaningful ideological and mechanical variation.
- This ladder turns endings into collectible testimony states rather than disposable flavor.

UX requirement:

- The recap and progression screens should always tell the player which ending states they have seen and which classes still need a `full-exposure` clear.

### 3.2 Roster ladder

Primary objective:

- Each win should immediately unlock or nearly unlock another class or companion.
- Unlock cadence must make a clear feel materially larger than a failed run without making failures feel useless.

Why it works:

- Current class costs are `26-48` chits.
- Current companion costs are `28-42` chits.
- The scripted victory path already paid `105` chits, which means wins can drive immediate roster expansion if tuning stays generous enough.

UX requirement:

- The post-run screen should show what the win moved closer to, not just how many chits were earned.
- The hub and progression routes should preserve that momentum with one obvious requisition target.

### 3.3 Relationship ladder

Primary objective:

- Push bond scenes, companion synergies, and archive coverage harder after first win.

Why it works:

- The repo already treats bond growth as persistent run impact.
- Party synergies are one of the cleanest ways to make two runs with the same class feel different.
- Archive coverage turns replay into testimony gathering instead of pure grind.

UX requirement:

- Winning should visibly advance at least one of: a bond scene, a synergy discovery, a new archive layer, or a proof dossier milestone.

## 4. Class truth-route lenses

Each class should feel like the strongest lens for a different truth route, so replaying another class changes what the run is trying to prove.

- `IT Support`: best at `force-the-truth-to-surface`. Lean into cleanse, disruption, and hostile-system override framing.
- `Sales Rep`: best at `authenticate-with-stolen-authority`. This class should feel best when gaming legitimacy, pressure, and polished access.
- `Paralegal`: best at completing the proof chain cleanly. This route should emphasize exact timing, document integrity, and trap-based authorship control.
- `Intern`: best at weird scavenging and risky proof acquisition. This class should feel like the high-variance route for pulling impossible evidence out of bad rooms.
- `Customer Service Rep`: best at survival-heavy clears. This class should feel most reliable when the goal is to outlast Meridian and leave with testimony intact.

Implementation rule:

- Future event hooks, reward hooks, boss reactions, archive copy, and class-select messaging should reinforce these route identities so the player is choosing an angle on Meridian rather than only a different combat kit.

## 5. Launch-ready retention systems

These retention systems are now implemented in the runtime. Before a premium public release, they still need tuning, outside-player proof, and honest pricing validation.

### 5.1 Optional probation contract mode

Purpose:

- Add structured pressure without punishing baseline players.

Design:

- Unlock after the first baseline win.
- Present as an opt-in challenge contract, not the default way to play.
- Ask the player to secure a target result within a limited number of runs, for example a clean win, a truth-state clear, or a roster milestone.
- Reward completion with bonus chits, archive badge progress, and quarterly ladder score.
- Failure should only break the active contract and any attached score bonus. It must never wipe the profile.

### 5.2 Quarterly challenge ladders

Purpose:

- Give returning players a rotating long-tail objective that reuses the core run structure.

Design:

- Run on a quarterly cadence to match the company satire and content roadmap.
- Use separate ladder categories for Truth, Roster, and Relationship priorities.
- Rotate challenge modifiers, proof emphases, and featured companions instead of replacing the core loop.
- Use archive flags, not one-time manual codes, as the real unlock state.
- Optional shareable dossier strings can exist as flavor, but progress must come from saved profile state.

### 5.3 Bonus rewards for winning within N runs

Purpose:

- Reward mastery and tempo without punishing players who take longer.

Design:

- Award milestone bonuses for wins achieved within thresholds such as 3, 5, or 7 runs on a fresh ladder or class dossier.
- Use bonus chits, proof progress, dossier fragments, or quarterly ladder score.
- Missing a threshold should remove only the bonus, never the base reward or the underlying progress.

### 5.4 Temporary score decay, never profile wipes

Purpose:

- Keep challenge ladders active without turning the game into a punishment machine.

Design:

- Apply temporary score decay only to probation contracts and quarterly ladders.
- Let inactivity or failed challenge pushes decay ladder score, contract rank, or leaderboard placement.
- Never delete unlocked classes, companions, bond levels, archive history, or core meta progression.

## 6. Recommended win-state UX copy

These copy blocks should be treated as direction for the live recap and progression surfaces.

### 6.1 First baseline win

- Banner: `Run Clear`
- Subtitle: `You got out alive. Meridian did not get the clean report it wanted.`
- Summary body: `This was a real win, not a tutorial certificate. Now pick what the next climb is for: a new truth state, a new requisition, or deeper crew testimony.`
- Next-goal card title: `Choose Your Next Ladder`
- Next-goal card body: `Truth: collect every ending state. Roster: turn wins into new classes and companions. Relationship: deepen bond scenes, party synergies, and archive coverage.`

### 6.2 Full Exposure / total win

- Banner: `Full Exposure`
- Subtitle: `The company is still standing. Its deniability is not.`
- Summary body: `You achieved the strongest clear. The next sticky goal is not repetition. It is perspective: get Full Exposure with a different class and watch a different part of Meridian become legible.`
- CTA: `Review Truth Ladder`

### 6.3 Quiet Survival / incomplete truth win

- Banner: `Survival Logged`
- Subtitle: `You lived. The deepest file did not open.`
- Summary body: `This is a valid clear, not the final testimony. Come back for the proofs, the cleaner route, or the crew that can carry a harder confession.`
- CTA: `Continue the Case`

### 6.4 Roster win reinforcement

- Inline recap line: `This clear moved another requisition into reach.`
- Hub follow-up line: `Spend the payout now or bank it for a more specialized witness.`

### 6.5 Relationship win reinforcement

- Inline recap line: `The archive got bigger because the crew trusted you enough to leave evidence in it.`
- Bonds follow-up line: `A stronger crew should reveal a different Meridian next run, not just a safer one.`

## 7. Post-launch roadmap

### 7.1 Management Track alternate mode

Unlock condition:

- `full-exposure` achieved at least once.

Pitch:

- A satirical `Management Track` mode where the player uses stolen executive authority and watches optimization turn into harm almost immediately.

Rules:

- Treat it as an alternate mode, not a canon sequel that replaces the survivor/testimony fantasy.
- Keep the tone accusatory and self-incriminating: the point is to show how quickly power rationalizes damage.
- Use it to deepen the archive theme rather than celebrate domination.

### 7.2 Quarterly episodic structure

#### Q1: Proof Dossier

- Add a new proof dossier layer.
- Ship 2 to 3 new event sheets focused on onboarding/compliance.
- Emphasize the earliest executive lies and archive paperwork that should have existed from the start.

#### Q2: Throughput Sabotage

- Add a throughput sabotage pack.
- Ship a new miniboss mutator tied to quota escalation, permissions, or line-speed cruelty.
- Use this quarter to make the mid-game feel less solved.

#### Q3: Board Leak

- Add a board leak pack.
- Ship at least one new class/companion synergy set aimed at late-run truth routing.
- Emphasize authority theater, quorum mechanics, and polished consensus as a damage engine.

#### Q4: Aftermath / Counteroffensive

- Add an aftermath and counteroffensive pack.
- Introduce a post-win challenge mode that assumes the player already understands the archive game.
- Use this quarter to set up the Management Track unlock path if it is not already live.

## 8. Pre-launch proof checklist

Before launch, collect proof in the same order the user experiences the product.

### 8.1 Main-path proof

- Run the full release-build path on real Android hardware, not only emulator or dev builds.
- Verify first-session clarity in the first 30 seconds and again at the first recap.
- Confirm the post-win ladder messaging lands without needing design-doc context.

### 8.2 Guided outside testing

- Watch at least a small set of guided testers complete the first session without coaching.
- Record where they hesitate, misread terminology, or fail to see the next goal.
- Treat repeated first-session confusion as a release blocker, not polish debt.

### 8.3 Trust and store proof

- Support contact, privacy language, permissions, and store declarations must match the shipped app exactly.
- Screenshots, description, icon, and feature graphic must describe the actual live loop and tone rather than a future version.
- No placeholder, future-feature, or fake-control language should survive in launch materials.

### 8.4 Measurement and support proof

- Confirm whether launch uses verified production analytics/crash reporting or a deliberate low-data/no-production-telemetry approach.
- If using the low-data route, document what manual evidence replaces live instrumentation during the launch window.
- Make sure support triage and bug-report intake are ready before public release, not after the first bad review wave.

## 9. Documentation and tuning follow-through

Before release, the following must stay aligned:

- `src/progression/next-goal.ts` should keep the post-win ladder framing explicit.
- `README.md` and `PROJECT_HANDOFF_2026-04-14.md` should treat pacing, retention, and pricing fit as a real release gate.
- `docs/design-spec-audit.md` should continue marking retention and live-ops as incomplete until they are proven, not merely described.
- Future class and event extensions should reinforce the class truth-route lenses instead of flattening them into generic combat variety.
