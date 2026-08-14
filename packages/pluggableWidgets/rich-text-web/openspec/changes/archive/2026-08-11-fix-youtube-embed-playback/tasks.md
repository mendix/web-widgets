## 1. Derive the embed URL in the node view

- [x] 1.1 In `src/components/YouTubeResize.tsx`, import `getEmbedUrlFromYoutubeUrl` from `@tiptap/extension-youtube`
- [x] 1.2 Read the extension's resolved options from `props.extension.options` (`NodeViewProps` already exposes `extension`)
- [x] 1.3 Compute the embed URL with `useMemo`, forwarding the same option set `renderHTML()` uses (`nocookie`, `controls`, `rel`, `loop`, `modestBranding`, `origin`, `playlist`, `progressBarColor`, `ccLanguage`, `ccLoadPolicy`, `interfaceLanguage`, `ivLoadPolicy`, `disableKBcontrols`, `enableIFrameApi`, `endTime`, `allowFullscreen`, `autoplay`) plus `startAt: node.attrs.start || 0`
- [x] 1.4 Memo key: `[node.attrs.src, node.attrs.start, props.extension.options]` — must be stable across resize `mousemove` so a drag never mutates `src`
- [x] 1.5 Use the computed URL as the iframe `src` (replace `node.attrs.src` at line 82); do NOT write it back into `node.attrs`

## 2. Warning placeholder when conversion fails

- [x] 2.1 When the computed URL is `null`, render the `NodeViewWrapper` + container without an `<iframe>` (never `src={null}` and never fall back to `node.attrs.src`)
- [x] 2.2 Render visible warning text from `t("video.unplayableSource", ...)` — the failure must not be silent or zero-size
- [x] 2.3 Size the placeholder box to the node's stored `width`/`height` so document layout does not shift
- [x] 2.4 Show the stored `node.attrs.src` as a plain React text child — never `dangerouslySetInnerHTML`, never an `<a href>`; truncate for display
- [x] 2.5 Do NOT render resize handles in the placeholder state
- [x] 2.6 Confirm the node stays selectable and deletable in that state
- [x] 2.7 Add SCSS for the placeholder in `src/ui/RichText.scss` alongside the existing `.youtube-wrapper` rules; prefix the class with the widget/node name, no Atlas core overrides, and meet 4.5:1 contrast for the warning text

## 3. iframe attributes and i18n

- [x] 3.1 Add `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"`
- [x] 3.2 Add `video.frameTitle` and `video.unplayableSource` (with `###` interpolation for the src, matching the `video.detected` convention) to `src/utils/i18n/locales/en.json` and all sibling locales (`de`, `es`, `fr`, `nl`)
- [x] 3.3 Set `title` on the iframe from `useT()` — no video id interpolated
- [x] 3.4 Do NOT add a `sandbox` attribute (would break the YouTube player; src is already constrained to youtube hosts by `isValidYoutubeUrl`)

## 4. Unit tests

- [x] 4.1 New spec under `src/extensions/__tests__/` (or `src/components/__tests__/`) covering the node view's iframe `src`
- [x] 4.2 `watch?v=<id>` → iframe `src` starts with `https://www.youtube.com/embed/<id>`
- [x] 4.3 `youtu.be/<id>` → embed URL for `<id>`
- [x] 4.4 already-`/embed/<id>` → passed through, no doubled `/embed/`
- [x] 4.5 `nocookie: true` → in-editor host is `www.youtube-nocookie.com` AND matches `editor.getHTML()` (do not hardcode `www.youtube.com`)
- [x] 4.6 non-zero `start` attr → start parameter present in-editor and equal to the `getHTML()` value
- [x] 4.7 unrecognised `src` → no `<iframe>` rendered, warning text visible, stored src present as text, no `<a>` element, no resize handles
- [x] 4.8 `title` non-empty and `allow` present
- [x] 4.9 Regression guard: `editor.getHTML()` still emits `<div data-youtube-video>` + embed-URL iframe
- [x] 4.10 Parse-back: load stored HTML with `div[data-youtube-video] iframe[src=".../embed/<id>"]` → renders a playable embed URL
- [x] 4.11 `pnpm run test -u` if `src/__tests__/__snapshots__/RichText.spec.tsx.snap` changes from the new `title`/`allow` attributes — not needed. The 6 snapshot failures are pre-existing on `0a4c88e8d` (wrapper class + `width`/`height` inline styles), verified by stashing this change and re-running. No snapshot covers a YouTube node, so `-u` was deliberately NOT run: it would have baked in unrelated in-progress drift.

## 5. Manual testing

<!-- Confirmed working by the user in Studio Pro. -->

- [x] 5.1 Dialog URL tab, `https://www.youtube.com/watch?v=<id>` → video renders and plays; console has no `X-Frame-Options` refusal
- [x] 5.2 Paste a bare YouTube link into the editor → video renders and plays
- [x] 5.3 Reload a saved document containing a YouTube video → renders and plays
- [x] 5.4 Drag each of the four corner handles → resizes, aspect ratio held, player does NOT reload/restart
- [x] 5.5 Fullscreen button inside the player works
- [x] 5.6 Select the node and delete it → removed cleanly
- [x] 5.7 Non-YouTube platforms (Vimeo, Dailymotion) still go through `GenericEmbed` unchanged
- [x] 5.8 Hand-edit a stored document's YouTube iframe src to garbage, reload → warning placeholder visible at the original size, src readable, node deletable

## 6. E2E

- [x] 6.1 Extend `e2e/RichText.spec.js`: insert a YouTube URL via the dialog, assert the iframe's `src` matches `/embed/` and that `title` is set — assert on attributes only, never on frame contents (no third-party network dependency, per `docs/requirements/e2e-test-guidelines.md`)

## 7. Documentation

- [x] 7.1 `CHANGELOG.md` under `## [Unreleased]` → `### Fixed`: YouTube videos inserted or pasted into the editor now play instead of showing a blank frame. User-facing wording only, no implementation detail.
