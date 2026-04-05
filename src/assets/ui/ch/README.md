# DDBD Core Chrome Pack R1

This pack contains reusable, scalable core UI chrome for the main portrait Android runtime.

## Included
- core-main-shell
- core-section-header
- core-legend-panel
- core-modal-panel
- core-info-card
- core-bottom-action-bar
- core-toggle-row
- core-choice-pill
- core-choice-pill-selected
- core-tooltip-panel
- core-overlay-frame

## Style lock used
- flat vector + distressed corporate grime
- dark UI with horror accents
- corporate HR portal feel
- conservative universal-design bias
- strong silhouette readability on mobile screens

## Export structure
- svg/default/ -> primary dark-UI assets
- svg/mono/ -> high-contrast / mono fallback
- png/128/ -> smaller raster fallback
- png/256/ -> larger raster fallback
- docs/accessibility_labels_map.csv
- docs/manifest.json
- preview/ddbd_core_chrome_pack_preview.png

## Implementation guidance
- Prefer SVG at runtime when possible.
- Keep all important text in runtime UI, not baked into art.
- Use the mono versions for high-contrast-safe fallback/theme support.
- Treat chrome assets as decorative containers; interactive semantics belong to the actual controls.
- Keep tap targets 48dp minimum even if the art itself is smaller.

## Suggested short repo placement
- src/assets/ui/ch/
- src/assets/ui/docs/

Suggested short names:
- ch/main-shell.svg
- ch/section-header.svg
- ch/legend-panel.svg
- ch/modal-panel.svg
- ch/info-card.svg
- ch/action-bar.svg
- ch/toggle-row.svg
- ch/choice-pill.svg
- ch/choice-pill-selected.svg
- ch/tooltip-panel.svg
- ch/overlay-frame.svg

## Scope note
This pack is meant to reduce shared readability and visual-cohesion debt across route, reward, event, recap, settings, and hub screens. It is not biome-specific background art or character illustration.
