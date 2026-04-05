# DDBD Biome Background + Overlay Pack R1

This pack contains portrait biome backdrops for the three live biomes plus reusable dim/blur overlay support.

## Included

### Biome backgrounds
- biome-orientation-arcade-bg
- biome-throughput-maze-bg
- biome-executive-apex-bg

### Overlay support
- overlay-dim-soft
- overlay-dim-strong
- overlay-blur-veil
- overlay-focus-window

## Style lock used
- flat vector + distressed corporate grime
- dark UI with horror accents
- corporate HR portal feel
- conservative universal-design bias
- text-free art with readability preserved through overlays

## Source-of-truth interpretation
- Orientation Arcade -> onboarding carnival / applause machinery / coercion framed as celebration
- Throughput Maze -> cubicle warrens / printer heat / KPI shrines / workflow machinery
- Executive Apex -> boardroom glass / investor polish / roots / approved harm

## Export structure
- svg/default/
- png/360x640/
- png/1080x1920/
- docs/accessibility_labels_map.csv
- docs/manifest.json
- preview/ddbd_biome_background_overlay_pack_preview.png

## Suggested short repo placement
- src/assets/art/bg/
- src/assets/ui/ov/
- src/assets/ui/docs/

Suggested short names:
- bg/orientation-arcade.svg
- bg/throughput-maze.svg
- bg/executive-apex.svg
- ov/dim-soft.svg
- ov/dim-strong.svg
- ov/blur-veil.svg
- ov/focus-window.svg

## Integration notes
- Put the biome art behind route, reward, event, recap, and hub shells.
- Keep the stronger overlays for dense copy surfaces.
- Keep the softer overlays for route and reward surfaces where more environment can stay visible.
- Do not bake any floor text into the background art.
