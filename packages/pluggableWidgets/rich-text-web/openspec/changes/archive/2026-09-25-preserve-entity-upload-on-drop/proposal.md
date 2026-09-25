## Why

Rich Text currently opens the image dialog when an image is dropped or pasted, but it does not complete the same entity-upload handoff that version 4.12.0 provided when an image source is configured. That leaves entity upload visible but inert in the drop/paste path, which is a regression for users relying on the File Uploader widget.

## What Changes

- Preserve the existing image dialog entry point for dropped and pasted image files when an entity image source is configured.
- Ensure the entity-upload path still receives dropped/pasted files instead of stopping after the dialog opens.
- Keep the default base64 upload path limited to the default-upload flow.
- Maintain the current tab-visibility rules: the Upload tab stays hidden when `enableDefaultUpload` is `false`.
- Keep dialog presentation and toolbar ownership unchanged; this change is about completing the image handoff, not redesigning the dialog.

## Capabilities

### New Capabilities

- None. This change updates existing image-upload behavior rather than introducing a new user-facing feature.

### Modified Capabilities

- `rich-text-image-dialog`: the dialog must continue to accept dropped/pasted files and hand them off correctly when entity upload is available.
- `rich-text-image-paste-drop`: dropping or pasting images should preserve the entity-upload behavior when an image source is configured, instead of only opening the dialog and stopping.

## Impact

- Affects the rich-text image dialog flow in `packages/pluggableWidgets/rich-text-web`.
- Affects the drop/paste extension that routes image files into the dialog.
- Expected test impact: image dialog and image paste/drop regression coverage will need updates.
- No public API shape change is expected.
