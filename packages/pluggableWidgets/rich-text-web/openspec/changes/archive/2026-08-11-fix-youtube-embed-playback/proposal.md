## Why

A YouTube URL inserted via the video dialog is added to the document but the video never renders — the iframe area stays blank and the console reports:

```
Refused to display 'https://www.youtube.com/' in a frame because it set 'X-Frame-Options' to 'sameorigin'.
```

Root cause: the rendered iframe points at a **watch** URL (`https://www.youtube.com/watch?v=<id>`) instead of an **embed** URL (`https://www.youtube.com/embed/<id>`). YouTube serves `X-Frame-Options: sameorigin` on `/watch` (which redirects to `youtube.com/`, the URL named in the error), so only `/embed/` is framable.

`@tiptap/extension-youtube` stores the canonical watch URL in `node.attrs.src` by design and converts it to an embed URL inside `renderHTML()` via `getEmbedUrlFromYoutubeUrl()`. Our `YouTubeResize` extension replaces the node's editor DOM with a `ReactNodeViewRenderer`, so `renderHTML()` never runs for the in-editor view. The node view component then passes `node.attrs.src` straight into the iframe, skipping the conversion.

```
setYoutubeVideo({ src: "https://www.youtube.com/watch?v=<id>" })
        │
        ▼
node.attrs.src = ".../watch?v=<id>"        <- canonical, per extension design
        │
        ├────────────────────────────┬────────────────────────────
        ▼                            ▼
 renderHTML() (DOMSerializer)   ReactNodeViewRenderer(YouTubeResize)
 getEmbedUrlFromYoutubeUrl()    <iframe src={node.attrs.src} />
        │                            │
        ▼                            ▼
 .../embed/<id>       OK        .../watch?v=<id>       BLOCKED
 (editor.getHTML output)        (what the user sees while editing)
```

Consequence: the persisted HTML is correct, but the video is unplayable inside the editor. The same gap applies to the paste path — `addPasteRules` also stores `{ src: match.input }`, i.e. a watch URL.

## What Changes

- `YouTubeResize` node view derives the iframe `src` from `node.attrs.src` using the extension's own `getEmbedUrlFromYoutubeUrl()` (exported from `@tiptap/extension-youtube`), so the in-editor iframe matches what `renderHTML()` produces. `node.attrs.src` stays canonical — no attribute-shape change, no migration of existing content.
- The extension's configured options (`nocookie`, `controls`, `rel`, `startAt`/`start`, …) are fed into the conversion so the in-editor player matches the saved output rather than diverging from it.
- If conversion returns `null` (unrecognised or tampered src), the node view renders a visible warning placeholder — sized to the node's stored dimensions, showing the stored URL as plain text — instead of an iframe pointing at an arbitrary URL. Failing silently into an empty wrapper is explicitly rejected: it reads as data loss.
- The iframe gains the `allow` and `title` attributes it currently lacks: `allow` for fullscreen/autoplay/DRM-protected playback, `title` for the WCAG 2.2 AA frame-name requirement.

## Capabilities

### New Capabilities

- `youtube-video-embed`: YouTube videos inserted by URL, by paste, or loaded from stored HTML play inside the editor, are resizable, and expose an accessible frame title.

### Modified Capabilities

<!-- None. No existing spec covers the YouTube node. -->

## Impact

**Files affected**:

- `src/components/YouTubeResize.tsx` — convert `node.attrs.src` to an embed URL; add `allow`/`title`; placeholder on conversion failure
- `src/extensions/YouTubeResize.ts` — expose the extension's resolved options to the node view (via `extension.options` on `NodeViewProps`, no new plumbing expected)
- `src/ui/RichText.scss` — styles for the warning placeholder, alongside the existing `.youtube-wrapper` rules
- `src/utils/i18n/locales/*.json` — `video.frameTitle`, `video.unplayableSource` (all five locales)
- `src/extensions/__tests__/` — new unit tests
- `e2e/RichText.spec.js` — E2E coverage for insert-and-play
- `CHANGELOG.md` — user-facing entry

**User-facing changes**:

- YouTube videos inserted via the video dialog now play inside the editor instead of rendering a blank frame.
- Pasting a YouTube link also produces a playable video.
- Existing documents render correctly without migration: stored HTML already contains embed URLs, and watch URLs in stored content are converted on render.

**Testing scope**:

- Insert `https://www.youtube.com/watch?v=<id>` via the dialog URL tab → iframe `src` is `.../embed/<id>`
- Insert a `youtu.be/<id>` short link → same
- Insert an already-`/embed/<id>` URL → passed through unchanged (no double conversion)
- Paste a bare YouTube link into the editor → playable
- Load stored HTML containing `<div data-youtube-video><iframe src=".../embed/<id>">` → parses and renders playable
- `editor.getHTML()` still emits the embed URL (guard against regressing the already-working output path)
- Resize handles still work after the change
- `title` and `allow` present on the iframe

## Non-Goals

Two adjacent defects were found while diagnosing this. They are recorded here but deliberately excluded, because each belongs to a different capability and would blur this change's spec:

1. **Video dialog overwrites user-entered dimensions.** `VideoDialog.handleUrlChange` calls `setWidth`/`setHeight` from the matched `UrlPattern` (YouTube 560×314, Vimeo 425×350, …), silently discarding whatever the user typed. This affects every platform, not just YouTube — it belongs to a video-dialog capability.
2. **`EmbedResize` node view `sandbox` diverges from `GenericEmbed.renderHTML`.** The node view sets `sandbox="allow-scripts allow-same-origin …"`, the exact combination `GenericEmbed.renderHTML` documents as unsafe and avoids, because together they let framed content remove its own sandbox. Real-world risk is limited to embeds served from the app's own origin, but the in-editor and serialized iframes should not disagree on a security attribute. This is the same class of bug as the one fixed here — a node view drifting from its `renderHTML` — and belongs to the generic-embed capability.
