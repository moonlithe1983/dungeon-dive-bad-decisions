# DDBD Marker Patch — N3 completion

This patch adds the missing `new-badge` marker needed to close row N3 in the gameplay asset production sheet.

## Why this asset exists
The codex/archive UI already uses a runtime `fresh_tag` value of `New`, so the project has a grounded, existing need for a visual fresh-state marker. This patch keeps the asset symbol-only to respect the spreadsheet rule against baked text in core UI markers.

## Included files
- `svg/default/new-badge.svg`
- `svg/mono/new-badge.svg`
- `png/128/new-badge.png`
- `png/256/new-badge.png`
- `png/128/new-badge-mono.png`
- `png/256/new-badge-mono.png`
- `docs/accessibility_labels_map.csv`
- `docs/manifest.json`
- `preview/ddbd_marker_patch_preview.png`

## Design notes
- Folded-corner document badge shape to suggest archive/logged content
- Central sparkle to communicate fresh/new state without relying on text
- Default family uses ember orange + warm ivory accents for dark UI
- Mono family uses a single light value for high-contrast fallback

## Accessibility notes
- Do not expose the badge as a standalone screen-reader target
- Announce the parent content state instead, for example:
  - `Archive record, new`
  - `Root Access Shard, new unlock`
- Keep the UI copy source in code, not in the asset
