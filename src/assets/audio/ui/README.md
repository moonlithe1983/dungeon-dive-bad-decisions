# DDBD Audio MVP Pack R1

This pack contains a minimal, release-facing first pass of interaction cues and short stings.

## Included
- ui_route_select.wav
- ui_reward_reveal.wav
- ui_reward_claim.wav
- ui_event_open.wav
- ui_event_confirm.wav
- ui_invalid_tap.wav
- ui_boss_warning.wav
- ui_recap_sting.wav

## Intent
This is not a full soundtrack, VO pass, or polished final audio suite.
It is a bounded testing/useful-play pack intended to support:
- route selection
- reward reveal and claim
- event open and confirm
- invalid/locked feedback
- boss-door / elite warning
- defeat recap open

## Style direction used
- dark corporate-horror tone
- short readable cues over tiny speakers
- conservative universal-design bias
- useful alongside visible text and icon states
- no meaning carried by sound alone

## Recommended short repo placement
- src/assets/audio/ui/

Suggested short runtime names:
- route_select.wav
- reward_reveal.wav
- reward_claim.wav
- event_open.wav
- event_confirm.wav
- invalid_tap.wav
- boss_warning.wav
- recap_sting.wav

## Implementation notes
- Keep interaction cues short.
- Do not stack multiple stings on top of voice lines.
- Pair locked/invalid audio with visible UI feedback.
- Give players an SFX volume or mute path.
- Treat these files as MVP-safe placeholders/finals depending on test response.
