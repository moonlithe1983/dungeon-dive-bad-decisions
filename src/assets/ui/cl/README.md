# DDBD Class Emblems Pack R1

This pack contains the five live class emblems for the current game data.

## Included
- it-support
- human-resources
- finance
- compliance
- operations

## Export structure
- svg/default/ -> primary dark-UI assets
- svg/mono/ -> high-contrast / mono fallback
- png/128/ -> smaller raster fallback
- png/256/ -> larger raster fallback
- docs/accessibility_labels_map.csv
- docs/manifest.json
- preview/ddbd_class_emblems_pack_preview.png

## Style lock used
- flat vector + distressed corporate grime
- dark UI with horror accents
- corporate HR portal feel
- conservative universal-design bias
- readable emblem silhouettes at mobile sizes

## Suggested short repo placement
- src/assets/ui/cl/
- src/assets/ui/docs/

Suggested short names:
- cl/it.svg
- cl/hr.svg
- cl/fin.svg
- cl/comp.svg
- cl/ops.svg

## Integration notes
- Pair each emblem with visible role title text.
- Do not encode unlock, danger, or selected state only through emblem color.
- Use mono variants for high-contrast or theme fallback support.
