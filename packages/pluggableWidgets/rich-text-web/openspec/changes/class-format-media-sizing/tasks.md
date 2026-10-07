## 1. Baseline

- [ ] 1.1 Measure current rendering in Chromium (inline format) for: pixel-sized image, v4 bare-number image, `50%` image, image wider than the editor, YouTube video, generic embed; record sizes as the reference for 6.1
- [x] 1.2 Check whether the class-mode e2e page contains an image or video; decide e2e coverage vs. manual verification

## 2. Format option

- [x] 2.1 Add `styleDataFormat` option (default `"inline"`) to `ImageResize`, `YouTubeResize` and `GenericEmbed`
- [x] 2.2 Pass `styleDataFormat` to the three extensions in `Editor.tsx`

## 3. Components

- [x] 3.1 Add a shared helper that returns inline `style` (inline format) or `data-width` / `data-height` (class format) for a sized box, omitting `auto` / missing values
- [x] 3.2 `ImageResize.tsx`: use the helper on the container; in class format give the `<img>` no size style
- [x] 3.3 `YouTubeResize.tsx`: use the helper on the container and the unplayable placeholder; in class format give the `<iframe>` no size style (keep `width` / `height` attributes)
- [x] 3.4 `EmbedResize.tsx`: same as 3.3 for the embed container and `<iframe>`

## 4. Stylesheet

- [x] 4.1 Add container sizing rules for `.image-container`, `.youtube-container`, `.embed-container` and `.youtube-unplayable` using `attr(... type(<length-percentage>))`, placed with the existing media rules in `RichText.scss`
- [x] 4.2 Hand the container size to the `<img>` / `<iframe>` through inherited custom properties (`--rt-media-width` / `--rt-media-height`)
- [x] 4.3 Compile the stylesheet and confirm the new rules are emitted and out-rank the existing `img { height: auto }` rule where intended

## 5. Table wrapper

- [x] 5.1 Remove the inline `position: relative` from `TableBackgroundColorNodeView`; confirm `.tableWrapper` in `TableStyle.scss` covers it

## 6. Verification

- [ ] 6.1 Manual check in Chromium, class format: every case from 1.1 renders at the reference size, in the editor and read-only
- [ ] 6.2 Manual check: drag-resize image, video and embed; live preview works, no inline `width` / `height` appears, size commits once (single undo step)
- [ ] 6.3 Manual check: image wider than the editor keeps its aspect ratio; adjust the fill rule if it distorts
- [ ] 6.4 Manual check: table resize handles still anchor to the table after 5.1
- [x] 6.5 Add or update e2e coverage per the decision in 1.2

## 7. Unit tests

- [x] 7.1 Image, class format: container has `data-width` / `data-height`, no inline sizing on container or `<img>`; v4 bare number becomes `px`; percentage kept; no stored size emits no attributes
- [x] 7.2 YouTube, class format: container data attributes, `<iframe>` keeps `width` / `height` attributes, no inline sizing; unplayable placeholder covered
- [x] 7.3 Generic embed, class format: same assertions as 7.2
- [x] 7.4 Inline format: existing inline sizing unchanged for all three, no data attributes
- [x] 7.5 Serialized HTML for image and video is identical in both formats
- [x] 7.6 Update existing component specs or snapshots affected by the new option

## 8. Release notes

- [x] 8.1 Add a `CHANGELOG.md` entry under Unreleased describing class-format media sizing in the widget, including the browser support note and any percentage-width behavior change found in 1.1 / 6.1
- [x] 8.2 Run the package unit tests and confirm lint is clean
