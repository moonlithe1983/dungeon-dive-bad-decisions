# DDBD Floor Badges + Headers Pack R1

This pack contains reusable floor badges and larger floor header plates for the current 10-floor run, plus 3 biome act headers.

## Included

### Floor badges and headers
- floors 1 through 10
- one compact badge per floor
- one larger header plate per floor

### Biome act headers
- Orientation Arcade
- Throughput Maze
- Executive Apex

## Source-of-truth floor titles
1. Welcome to Meridian Spire
2. Audience Participation
3. Performance Improvement Round
4. Corrective Showcase
5. Cubicle Herd
6. Variance Review
7. Quarterly Sacrifice
8. Marble Permission
9. Consensus Garden
10. Consensus Engine

## Export structure
- svg/default/
- svg/mono/
- png/badge/ -> 256x96 compact exports
- png/header/ -> 1080x220 header exports
- docs/accessibility_labels_map.csv
- docs/manifest.json
- preview/ddbd_floor_badges_headers_pack_preview.png

## Style lock used
- flat vector + distressed corporate grime
- dark UI with horror accents
- corporate HR portal feel
- conservative universal-design bias
- compact progress readability on phone screens

## Suggested short repo placement
- src/assets/ui/fl/
- src/assets/ui/docs/

Suggested short names:
- fl/f01-badge.svg
- fl/f01-header.svg
- fl/f10-badge.svg
- fl/f10-header.svg
- fl/act-orientation.svg
- fl/act-throughput.svg
- fl/act-executive.svg

## Integration notes
- Use badges in progress strips, archive summaries, and route chips.
- Use larger header plates on map-intro, floor-intro, recap, or boss-adjacent transition surfaces.
- Keep all visible floor title text in runtime typography.
