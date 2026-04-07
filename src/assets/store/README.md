# DDBD Store Media Pack R1

This pack contains the current approved Google Play store-media set for Dungeon Dive: Bad Decisions.

## Included

### App icon
- ddbd_play_icon_default
- ddbd_play_icon_mono

### Feature graphic
- ddbd_feature_graphic_default
- ddbd_feature_graphic_mono

### Screenshot composition templates
- ss_title_template_default
- ss_route_template_default
- ss_battle_template_default
- ss_reward_template_default
- ss_event_template_default
- ss_recap_template_default
- mono variants for all six
- ss_store_guide_1080x1920

## Intent

This pack follows the locked direction:
- flat vector + distressed corporate grime
- dark UI with horror accents
- corporate HR portal feel
- strong silhouette readability
- mature but store-safe
- conservative universal-design bias

## Usage

- Use `png/icon/ddbd_play_icon_default_512x512.png` as the Play listing icon master.
- Keep the icon square; do not pre-round the corners.
- Use `png/feature/ddbd_feature_graphic_default_1024x500.png` as the Play feature graphic master.
- The live Expo config now points app icon, adaptive icon, splash image, and web favicon at the approved icon export so runtime and store branding stay aligned.
- Use the feature graphic as a pure graphic treatment, not a screenshot collage.
- Use the screenshot templates as non-device composition overlays or reference layouts.
- Keep actual store screenshots centered on real UI, readable states, and large text.

## Suggested short repo placement
- src/assets/store/
- src/assets/store/icon/
- src/assets/store/feature/
- src/assets/store/screens/

## Scope note

This pack intentionally covers icon treatment, feature-graphic treatment, and screenshot composition support. It does not include final listing copy or a full promo campaign set.
