# Dungeon Dive: Bad Decisions — UI Asset Pack README

This README documents the first completed gameplay UI asset pass for **Dungeon Dive: Bad Decisions**.

It covers the bounded system-asset sets completed in the initial ship-ready pack:

- Route node icons
- Status icons
- Everrise proof icons
- Codex category icons
- Focus / selection markers
- Accessibility labels map

## Recommended repo path

Place this file at:

`C:\ddbd\src\assets\ui\rt\README.md`

That is the best location when this README is meant to describe **all** gameplay UI asset work from the first pack, not just one subfolder.

If you also want local notes for a specific sub-pack, keep short secondary READMEs inside family folders such as:

- `C:\ddbd\src\assets\ui\mk\README.md`
- `C:\ddbd\src\assets\ui\rt\README.md`
- `C:\ddbd\src\assets\ui\st\README.md`
- `C:\ddbd\src\assets\ui\pf\README.md`
- `C:\ddbd\src\assets\ui\cx\README.md`

## Scope

This pack is a **systems-driven UI asset pack**, not a full character-art or full-audio pack.

Primary covered asset families:

- **Route nodes**
- **Live status icons**
- **Everrise proof icons**
- **Codex category icons**
- **Markers** for focus, selection, targeting, locking, and fresh-state signaling
- **Accessibility support docs** for semantic labeling and implementation planning

## Style lock used

- Flat vector + distressed corporate grime
- Dark UI with horror accents
- Corporate HR portal feel
- Conservative universal-design bias
- Visual reference anchored to the supplied Google Play logo

## Universal design requirements

These assets were planned for a game with accessibility and readability requirements already in scope.

Use these rules when implementing or extending the pack:

- Do not use color alone to communicate state or meaning.
- Prefer clean silhouettes over decorative detail.
- Keep icons readable on dark backgrounds.
- Avoid baking gameplay-critical text into art when scalable UI text can do the job.
- Use redundant cues for warning, selected, locked, danger, and status states.
- Preserve high-contrast / monochrome compatibility.
- Keep screen-reader semantics at the control level, not on decorative overlays.

## Provenance / content assumptions

### Route node labels

Route node labels come from the late-floor route UI content:

- High risk
- Story node
- Package node
- Elite threat
- Boss floor

### Codex category labels

Codex category labels come from the codex archive UI:

- Companions
- Roles
- Bosses
- World
- Biomes
- Factions
- Items
- Proofs

### Everrise proof labels

Everrise proof labels come from the codex/content bundles:

- Orientation Badge Core
- Quorum Seal
- Root Access Shard

### Live status scope used for the first pass

The live build uses **5 current statuses** for the first gameplay icon pass:

- Hyped
- Misbadged
- Routed
- Backlogged
- Under Review

Important note:
The broader authored writing bundle contains more statuses than the first live gameplay icon set. This pack intentionally targets the first live set for release-hardening use.

## Expected folder layout

This README is written to work whether the UI assets are kept as one shared root pack or split into short family folders.

A recommended short-path layout is:

```text
src/
  assets/
    ui/
      README.md
      rt/
        svg/
          default/
          mono/
        png/
          128/
          256/
      st/
        svg/
          default/
          mono/
        png/
          128/
          256/
      pf/
        svg/
          default/
          mono/
        png/
          128/
          256/
      cx/
        svg/
          default/
          mono/
        png/
          128/
          256/
      mk/
        svg/
          default/
          mono/
        png/
          128/
          256/
        docs/
        preview/
      docs/
        accessibility_labels_map.csv
        manifest.json
      preview/
        ddbd_starter_asset_pack_preview.png
```

Short family codes:

- `rt` = route nodes
- `st` = statuses
- `pf` = Everrise proofs
- `cx` = codex categories
- `mk` = markers

If your current repo instead stores a shared export root with these folders:

- `svg/default/`
- `svg/mono/`
- `png/128/`
- `png/256/`
- `docs/`
- `preview/`

this README still applies.

## Files

Primary export conventions:

- `svg/default/` → primary color assets for dark UI
- `svg/mono/` → monochrome fallback / high-contrast-friendly assets
- `png/128/` → 1x raster fallback
- `png/256/` → 2x raster fallback
- `docs/accessibility_labels_map.csv` → screen reader / semantics planning
- `docs/manifest.json` → machine-readable file map
- `preview/ddbd_starter_asset_pack_preview.png` → quick review sheet

## Asset groups included

### Route node icons

Supported route node types:

- High risk
- Story node
- Package node
- Elite threat
- Boss floor

### Status icons

Supported first-pass live statuses:

- Hyped
- Misbadged
- Routed
- Backlogged
- Under Review

### Everrise proof icons

Supported proofs:

- Orientation Badge Core
- Quorum Seal
- Root Access Shard

### Codex category icons

Supported categories:

- Companions
- Roles
- Bosses
- World
- Biomes
- Factions
- Items
- Proofs

### Marker set

Marker family includes:

- Focus ring
- Selected ring
- Target reticle
- Locked overlay
- New badge

## Implementation recommendations

- Prefer SVG at runtime when possible.
- Keep icon render sizes around **24–32dp**.
- Keep tap targets at **48dp minimum**.
- Do not use color alone to communicate route type, status, or selection.
- Pair status icons with visible text, tooltips, or toasts.
- Pair route node icons with labels or a legend.
- Selection / focus markers should not be standalone screen-reader targets. Announce the parent control state instead.
- If the final live status set differs from the provisional five used here, swap labels/manifests first, then only redraw icons if needed.
- Do not import from `docs/` or `preview/` in app runtime code.

## Runtime usage guidance

Recommended usage rules:

- Use SVG where your runtime path can support it reliably.
- Use `png/128` for small HUD, compact status, or dense inline icon usage.
- Use `png/256` for codex, route map, proof display, and larger UI placements.
- Keep `svg/default` as the primary future-facing master set.
- Keep `svg/mono` available for accessibility/high-contrast fallback and theme switching.

A small mapping layer in code is recommended so variant swaps stay simple:

```ts
export const uiVariants = {
  default: 'default',
  highContrast: 'mono',
} as const;
```

## What this pack is not

This pack does **not** try to solve:

- full portrait illustration coverage
- final cast-wide character art
- full audio production
- broad store-media production
- every future authored status effect

It is intentionally scoped to the bounded symbolic UI assets best suited to early release-hardening work.

## Notes for future updates

- If you split the asset families into sibling folders, keep this README at `src/assets/ui/README.md` as the shared top-level reference.
- If you add new marker-only changes, document them in `src/assets/ui/mk/README.md` without replacing this top-level README.
- If later content expands the live status set beyond the current five, update the manifest and accessibility labels map before deciding whether icon redraws are necessary.
- Keep filenames short to reduce Windows path-length risk in the short-path workspace.

## Suggested next adjacent asset work

After this pack, the highest-value bounded follow-on work is:

- reward package icons
- class emblems
- core UI chrome / frames
- store screenshot compositions
- event readability support art for the live authored event subset

