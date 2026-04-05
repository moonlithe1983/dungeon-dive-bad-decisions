# DDBD Reward Package Icon + Reward UI Pack

This pack contains a release-facing first pass for reward package icons and reward-screen chrome.

## Included

### Reward package icons (12)
- patch-stack
- hostile-takeover
- paper-armor
- escalation-clause
- lunch-and-learn
- expense-account
- back-channel
- overtime-spiral
- sick-leave
- exit-package
- policy-knife
- budget-freeze

### Reward UI chrome
- reward-screen-panel
- reward-detail-panel
- reward-card-frame
- reward-card-selected
- inspect-button
- claim-button
- skip-button
- reroll-button

## Export structure
- svg/default/ -> primary dark-UI assets
- svg/mono/ -> high-contrast / mono fallback
- png/128/ -> small raster fallback
- png/256/ -> larger raster fallback
- docs/accessibility_labels_map.csv
- docs/manifest.json
- preview/ddbd_reward_ui_pack_preview.png

## Style lock used
- flat vector + distressed corporate grime
- dark UI with horror accents
- corporate HR portal feel
- conservative universal-design bias
- readable, emblem-like silhouettes at mobile sizes

## Implementation guidance
- Prefer SVG at runtime when possible.
- Keep package icon render sizes around 24-32dp.
- Keep tap targets at 48dp minimum.
- Pair each package icon with visible package title and descriptive text.
- Do not bake essential text into icon art.
- Treat card frames and panel backgrounds as decorative chrome; announce the parent control state instead.
- Keep mono assets available for high-contrast/theme switching.

## Suggested short repo placement
- src/assets/ui/rw/
- src/assets/ui/docs/

Suggested short names:
- rw/patch-stack.svg
- rw/hostile-takeover.svg
- rw/reward-card-frame.svg
- rw/claim-button.svg

## Scope note
This pack intentionally covers reward-facing art/UI only. It does not include audio, store media, event illustrations, or codex work.
