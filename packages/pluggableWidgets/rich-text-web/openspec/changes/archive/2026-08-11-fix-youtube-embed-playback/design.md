## Context

The rich text widget uses Tiptap 3.x. YouTube support comes from `@tiptap/extension-youtube@3.29.0`, wrapped by `src/extensions/YouTubeResize.ts` purely to attach a resizable React node view:

```ts
export const YouTubeResize = Youtube.extend({
    addNodeView() {
        return ReactNodeViewRenderer(YouTubeResizeComponent);
    }
});
```

### How the stock extension handles src

Verified in `node_modules/@tiptap/extension-youtube/dist/index.js`:

- `addAttributes()` declares `src`, `start`, `width`, `height`. There is no `renderHTML` on the `src` attribute, and nothing normalises it on the way in.
- `addCommands().setYoutubeVideo(options)` only runs `isValidYoutubeUrl(options.src)` and then `insertContent({ type, attrs: options })` — the URL is stored **verbatim**.
- `addPasteRules()` returns `nodePasteRule({ find: YOUTUBE_REGEX_GLOBAL, getAttributes: match => ({ src: match.input }) })` — also verbatim.
- `parseHTML()` matches `div[data-youtube-video] iframe` and, via `getAttributesFromYoutubeEmbedUrl`, **normalises an embed URL back to a watch URL** (`src = https://www.youtube.com/watch?v=<id>`).
- `renderHTML({ HTMLAttributes })` is the single place conversion happens:

```js
const embedUrl = getEmbedUrlFromYoutubeUrl({
    url: HTMLAttributes.src,
    nocookie,
    controls,
    rel,
    startAt: HTMLAttributes.start || 0 /* … */
});
HTMLAttributes.src = embedUrl;
return ["div", { "data-youtube-video": "" }, ["iframe", mergeAttributes(/* … */)]];
```

So the invariant the extension maintains is: **`attrs.src` is always the canonical watch URL; the embed URL exists only in serialized output.** That invariant is intentional and worth preserving — `parseHTML` actively converts back to it, so storing an embed URL in `attrs` would fight the round-trip.

### Why the node view breaks it

`ReactNodeViewRenderer` supplies the editor's DOM for the node, bypassing `renderHTML()` entirely (`renderHTML` remains in use by `DOMSerializer` for `editor.getHTML()`, and by the markdown spec). `src/components/YouTubeResize.tsx:82` therefore renders the raw canonical URL:

```tsx
<iframe src={node.attrs.src} width={size.width} height={size.height} allowFullScreen />
```

YouTube responds to `/watch` with `X-Frame-Options: sameorigin` (after a redirect to `youtube.com/`), so the frame is refused. Nothing about resizing, `pointer-events`, or SCSS is involved — `.resize-handles` has `pointer-events: none` but the handles re-enable it, and the iframe itself is never covered.

```
             ┌──────────────────────── node.attrs.src (canonical watch URL) ────────────────────────┐
             │                                                                                     │
   ┌─────────▼──────────┐                                                          ┌───────────────▼──────────────┐
   │ renderHTML()       │  getEmbedUrlFromYoutubeUrl(...)                          │ YouTubeResize node view      │
   │ DOMSerializer /    │  ──────────────────────────────▶  /embed/<id>   OK       │ <iframe src={attrs.src}/>    │
   │ getHTML / markdown │                                                          │  ──▶ /watch?v=<id>  BLOCKED  │
   └────────────────────┘                                                          └──────────────────────────────┘
             ▲                                                                                     ▲
        saved output                                                                     what the user edits
```

## Goals / Non-Goals

**Goals:**

- The in-editor iframe URL equals the URL `renderHTML()` would emit for the same node, so what the user sees while editing matches what is saved.
- Preserve the extension's `attrs.src` invariant (canonical watch URL) — no attribute change, no content migration, no fight with `parseHTML`.
- Fix all three entry paths at once: dialog insert, paste, and stored-HTML parse.
- Add the `allow` and `title` attributes the node view currently omits.

**Non-Goals:**

- Changing `VideoDialog`'s YouTube branch or the dimension-overwrite behaviour (see proposal Non-Goals).
- Touching `GenericEmbed` / `EmbedResize` (including its `sandbox` divergence — separate change).
- Re-implementing YouTube URL parsing. The extension already exports what is needed.
- Adding a `sandbox` attribute to the YouTube iframe. YouTube's player needs scripts, storage access, and fullscreen; sandboxing it would break playback, and the src is constrained to `youtube.com`/`youtube-nocookie.com` by `isValidYoutubeUrl` before the node is ever created.

## Decisions

### Decision 1: Convert in the node view, not at insert time

Two candidate fixes exist:

|       | Where                                                                          | Covers dialog insert | Covers paste | Covers stored HTML | Keeps `attrs` invariant |
| ----- | ------------------------------------------------------------------------------ | -------------------- | ------------ | ------------------ | ----------------------- |
| **A** | Convert `attrs.src` inside the node view                                       | yes                  | yes          | yes                | yes                     |
| **B** | `VideoDialog` passes `pattern.url` (already an embed URL) to `setYoutubeVideo` | yes                  | **no**       | **no**             | no                      |

Option B is tempting because `videoUrlPattern.matchPattern()` already computes `https://www.youtube.com/embed/<id>` and `VideoDialog.tsx:106` throws it away in favour of `urlInput.trim()`. It would work for the dialog (and `getEmbedUrlFromYoutubeUrl` short-circuits on `url.includes("/embed/")`, so `getHTML` would still be right). But `addPasteRules` and `parseHTML` both hand the node view a watch URL regardless of the dialog, so B leaves the bug reachable by pasting a link or reopening saved content. It also puts an embed URL into `attrs`, which `parseHTML` would convert back to a watch URL on the next load — so the two paths would disagree about what `attrs.src` means.

**Chosen: A.** One conversion at the single point that consumes the value for display.

### Decision 2: Reuse `getEmbedUrlFromYoutubeUrl`, do not hand-roll

`@tiptap/extension-youtube` exports `getEmbedUrlFromYoutubeUrl`, `isValidYoutubeUrl`, and `getAttributesFromYoutubeEmbedUrl` from its public entry point (confirmed in `dist/index.d.ts:195`). Using the exported helper guarantees the node view and `renderHTML()` cannot drift again — a hand-written regex would have to be kept in sync with `YOUTUBE_REGEX`, playlist handling (`/embed/videoseries?list=`), `youtu.be` short links, and `shorts/`.

The repo also has its own `src/utils/videoUrlPattern.ts` with YouTube patterns. It is **not** the right tool here: it is the dialog's platform-detection/validation layer, it does not know about the extension's options (`nocookie`, `controls`, `rel`, `start`), and it does not handle playlists or shorts.

### Decision 3: Pass the extension's options into the conversion

`renderHTML()` feeds roughly twenty configured options into `getEmbedUrlFromYoutubeUrl` (`nocookie`, `controls`, `rel`, `loop`, `modestBranding`, `startAt`, `origin`, …). If the node view calls the helper with only `{ url }`, the editing view and the saved output produce different player URLs — e.g. `nocookie: true` would be honoured on save but not while editing, which is a privacy-relevant discrepancy, not just cosmetic.

`NodeViewProps` exposes `extension`, so the node view can read `props.extension.options` and forward the same set, with `startAt: node.attrs.start || 0` matching `renderHTML`'s use of `HTMLAttributes.start`.

### Decision 4: Visible warning placeholder, not an iframe, when conversion fails

`getEmbedUrlFromYoutubeUrl` returns `null` for anything that fails `isValidYoutubeUrl` or has no extractable id. Rendering `<iframe src={null}>` (or falling back to `attrs.src`) would either produce a frame pointing at the current page or reintroduce the blocked-URL case. `GenericEmbed.renderHTML` already sets the precedent of refusing to emit an iframe for a src it cannot vouch for.

The node view refuses the iframe the same way, but renders a **visible warning placeholder** rather than an empty wrapper. An empty wrapper is indistinguishable from the video having been silently dropped — the user cannot tell whether the node is still there, whether their content was lost, or what to do about it. The placeholder makes the failure legible and recoverable:

- Sized to the node's stored `width`/`height`, so document layout does not shift when a video fails to convert.
- Warning text from i18n (`video.unplayableSource`, using the existing `###` interpolation convention).
- The offending `node.attrs.src` shown **as plain text** so the user can see what URL is stored and fix or replace it.
- No resize handles in this state — resizing a warning box is meaningless, and their absence is a clear signal that this is not a working video.
- The node stays selectable and deletable, so the user can remove or re-insert it.

Constraints on showing the src: it is untrusted string data from stored content. It goes in as a React text child (escaped, no `dangerouslySetInnerHTML`), never as an `<a href>` — a clickable attacker-supplied URL inside the editor would be a worse outcome than the blank frame this change fixes. Truncate for display so a pathological multi-kilobyte src cannot blow out the placeholder.

### Decision 5: `allow` and `title`

- `allow`: stock `renderHTML` does not set `allow` either, so this is a genuine addition rather than restoring parity. Without it, fullscreen, autoplay, and DRM-protected (`encrypted-media`) content misbehave in Chromium. Value: `accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share`.
- `title`: an iframe with no accessible name fails WCAG 2.2 AA. The node has no user-supplied caption, so the title comes from i18n (`video.frameTitle`, alongside the existing `video.*` keys in `src/utils/i18n/locales/*.json`) rather than a hardcoded English string. It does not interpolate the video id — an opaque 11-character id read aloud by a screen reader is noise, not information.

### Decision 6: i18n keys live under the existing `video.*` namespace

`src/utils/i18n/locales/en.json` already groups every dialog string for this feature under `video.*` (`video.title`, `video.errorUnsupported`, `video.embedWarning`, …) and uses `###` as the interpolation placeholder (`video.detected` = `'### video detected'`, consumed as `t("video.detected", platform)`). The two new strings follow that convention rather than opening a `youtube.*` namespace for two keys:

- `video.frameTitle` — the iframe's accessible name
- `video.unplayableSource` — the placeholder warning, with `###` for the stored src

## Risks / Trade-offs

- **Conversion cost per render.** `getEmbedUrlFromYoutubeUrl` runs regexes and builds a query string; the node view re-renders on every resize `mousemove`. Memoise on `[node.attrs.src, node.attrs.start, extension.options]` so drag-resize does not recompute the URL on each frame. Recomputing an identical `src` string is harmless for React (same value, no DOM write) but wasteful; a _changed_ `src` would reload the iframe mid-drag, so stability of the memo key matters.
- **`youtube-nocookie` behaviour.** If `nocookie` is enabled, the embed host changes to `www.youtube-nocookie.com`. Tests should not hardcode `www.youtube.com`.
- **Snapshot churn.** `src/__tests__/__snapshots__/RichText.spec.tsx.snap` mentions youtube; the added `title`/`allow` attributes may require `pnpm run test -u`.
- **E2E and third-party network.** An E2E test that asserts playback would depend on YouTube being reachable from CI. Per `docs/requirements/e2e-test-guidelines.md`, the E2E assertion should be on the iframe's `src`/`title` attributes, not on the frame's contents.

## Open Questions

- None. (Resolved: unconvertible src renders a visible warning placeholder — Decision 4; i18n keys `video.frameTitle` and `video.unplayableSource` — Decisions 5 and 6.)
