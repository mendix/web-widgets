## 1. Entity Upload Handoff

- [x] 1.1 Route pending dropped and pasted files from the image dialog into the embedded entity uploader when `imageSource` is configured.
- [x] 1.2 Keep the base64 upload path as the fallback when no image source is available.
- [x] 1.3 Preserve the current upload-tab visibility rules while applying the new handoff.

## 2. Verification

- [x] 2.1 Update or add regression tests for entity upload handoff and base64 fallback behavior.
- [x] 2.2 Run the focused rich-text image dialog and image paste/drop tests.
- [x] 2.3 Confirm the package still builds cleanly after the behavior change.
