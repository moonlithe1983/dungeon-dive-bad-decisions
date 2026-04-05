# DDBD Event Readability Pack R1

This pack contains a release-facing first pass for event-screen readability assets.

## Included

### Event scene backdrops
- event-generic-backdrop
- warm-badges-scene
- applause-threshold-scene
- career-accelerator-scene

### Event UI chrome
- event-screen-panel
- event-choice-card
- event-choice-selected
- event-confirm-button
- event-details-button
- event-continue-button

## Export structure
- svg/default/ -> primary dark-UI assets
- svg/mono/ -> high-contrast / mono fallback
- png/128/ -> small raster fallback
- png/256/ -> larger raster fallback
- docs/accessibility_labels_map.csv
- docs/manifest.json
- preview/ddbd_event_readability_pack_preview.png

## Style lock used
- flat vector + distressed corporate grime
- dark UI with horror accents
- corporate HR portal feel
- conservative universal-design bias
- event scenes support tone, but text remains the primary readable carrier

## Implementation guidance
- Prefer SVG at runtime when possible.
- Pair scene art with visible event title, prompt, and choice text.
- Keep event scenes supportive rather than mechanically essential.
- Treat chrome assets as decorative containers, not standalone screen-reader targets.
- Keep mono assets available for contrast/theme switching.

## Suggested short repo placement
- src/assets/ui/ev/
- src/assets/ui/docs/

Suggested short names:
- ev/warm-badges-scene.svg
- ev/applause-threshold-scene.svg
- ev/career-accelerator-scene.svg
- ev/event-choice-card.svg
- ev/event-confirm-button.svg

## Scope note
This pack intentionally covers the three currently integrated authored events plus generic event readability chrome. It does not cover the other authored event sheets, store media, or audio.
