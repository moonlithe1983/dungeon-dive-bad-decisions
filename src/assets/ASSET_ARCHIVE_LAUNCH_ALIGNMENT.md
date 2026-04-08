# Asset Archive And Launch Alignment

Last updated: April 7, 2026

This note exists so the repo has one explicit answer to a recurring question:
which authored packs are live, which are partially aligned to the current game
data, and which are intentionally archived for a later content phase.

## Live Runtime Packs

- `src/assets/ui/ch/`
  - Live via the shared loop surfaces.
- `src/assets/ui/ev/`
  - Live for event scene art and event-screen panel chrome.
- `src/assets/ui/rw/`
  - Live for the reward panel and the currently mapped reward package icons.
- `src/assets/ui/rt/`
  - Live for route node icons and archived result status icons.
- `src/assets/art/bg/`
  - Live as ambient biome background support on run-map, event, reward, and end-run.
- `src/assets/art/cp/`
  - Partially live for companions whose runtime IDs match the current launch roster.
- `src/assets/art/eh/`
  - Live through semantic alignment on standard battle intro/header surfaces.
- `src/assets/art/mh/`
  - Live through semantic alignment on miniboss battle intro/header surfaces.
- `src/assets/art/bh/`
  - Live on boss intro/header surfaces in battle and on boss archive update panels in end-run.
- `src/assets/art/er/`
  - Live on end-run through ending-state headers and archive recap accent panels.
- `src/assets/ui/fl/`
  - Live on run-map through current-floor header surfaces, act headers, and progress-strip badges.
- `src/assets/audio/ui/`
  - Live for route select, event open/confirm, reward reveal/claim, boss warning, defeat recap, and invalid-tap feedback.

## Launch Alignment Decisions

### Class Emblems

The class emblem pack was authored around five department tracks:

- `it-support`
- `human-resources`
- `finance`
- `compliance`
- `operations`

The current launch classes are role-based rather than department-name matches, so
runtime now uses an explicit semantic alignment:

- `it-support` -> `it-support`
- `customer-service-rep` -> `human-resources`
- `sales-rep` -> `finance`
- `intern` -> `operations`
- `paralegal` -> `compliance`

These emblems should be read as department-track marks, not literal job-title
replacement art.

### Companion Cards And Headers

The companion pack contains five authored companions:

- `facilities-goblin`
- `former-executive-assistant`
- `security-skeleton`
- `payroll-wraith`
- `wellness-witch`

The current launch roster only matches three of those IDs directly. Runtime now
uses the three matching companions and intentionally leaves the other two out of
the live UI:

- live: `facilities-goblin`
- live: `former-executive-assistant`
- live: `security-skeleton`
- archived for future roster/content alignment: `payroll-wraith`
- archived for future roster/content alignment: `wellness-witch`

### Enemy, Miniboss, And Boss Surfaces

The enemy and miniboss art packs were authored as overlay names rather than as a
canonical runtime roster. The current game data now uses explicit semantic
alignment maps so those intro/header surfaces can go live without pretending the
overlay names are the same thing as the runtime enemy IDs.

The boss pack is a closer fit and now maps directly by escalation layer:

- `hr-compliance-director` -> `boss-director-onboarding`
- `chief-synergy-officer` -> `boss-vp-throughput`
- `executive-assistant-to-the-abyssal-ceo` -> `boss-everrise-board`

Archive variants now also appear on the end-run recap once a run has breached
the corresponding escalation layer:

- floors `4-6` -> `boss-director-onboarding-archive`
- floors `7-9` -> `boss-vp-throughput-archive`
- floors `10+` -> `boss-everrise-board-archive`

These surfaces are supportive encounter framing, not source-of-truth naming.

### Ending And Recap Accents

The ending accent pack now has a live home on `end-run`. Runtime maps ending
headers and recap panels by result and climb depth instead of leaving the pack
parked as an unused archive:

- `win` on floor `10+` -> `full-exposure`
- `win` below floor `10` -> `controlled-detonation`
- `loss` on floor `8+` -> `partial-exposure`
- `loss` below floor `8` -> `licensed-survival`
- `abandon` -> `quiet-survival`

These surfaces now frame the final record and archive recap copy, while the
text itself remains runtime-owned.

### Bond Pair Archive

The bond scene pack was authored for pair-specific scenes, while the existing
launch bond system is built around solo companion milestone scenes. Runtime now
gives that pack a real home by treating the current-roster pair matches as a
separate `Pair Archive` inside the bonds screen.

Live pair archive entries:

- `facilities-goblin` + `former-executive-assistant`
- `facilities-goblin` + `security-skeleton`
- `former-executive-assistant` + `security-skeleton`

Still archived for future roster/content alignment:

- all `payroll-wraith` pair entries
- all `wellness-witch` pair entries
- the `payroll-wraith` + `wellness-witch` pair entry

## Intentionally Archived For Future Content

These packs remain in the repo on purpose, but they are not launch-critical and
should not be treated as missing-wiring bugs unless the associated content also
ships.

- `src/assets/ui/mk/`
  - Marker variants are waiting on more deliberate selection/locked-state overlays.

## Archive Rule

If an asset pack does not match current runtime IDs, screen structure, or the
current launch roster, keep it documented here instead of forcing it into the UI.
That keeps the launch build honest and preserves the authored work for the next
content phase.
