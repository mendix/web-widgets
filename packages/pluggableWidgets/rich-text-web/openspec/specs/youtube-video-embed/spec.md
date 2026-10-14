# youtube-video-embed Specification

## Purpose

YouTube videos embedded in the Rich Text editor render with a framable embed URL that matches the serialized HTML, stay resizable, expose an accessible frame title, and fail visibly rather than silently when the stored source cannot be converted.

## Requirements

### Requirement: The in-editor YouTube iframe uses an embed URL

The YouTube node view SHALL render its iframe with a YouTube **embed** URL (`https://www.youtube.com/embed/<id>`, or the `youtube-nocookie.com` equivalent when the extension's `nocookie` option is enabled), never a `watch`, `youtu.be`, or `shorts` URL. `node.attrs.src` SHALL remain unchanged (the canonical watch URL the `@tiptap/extension-youtube` extension stores), so the conversion is display-only.

#### Scenario: Watch URL inserted via the video dialog

- **WHEN** the user enters `https://www.youtube.com/watch?v=<id>` in the video dialog URL tab and submits
- **THEN** the iframe rendered in the editor has `src` starting with `https://www.youtube.com/embed/<id>`
- **AND** no `X-Frame-Options` refusal is logged
- **AND** the video is playable

#### Scenario: Short youtu.be link

- **WHEN** the user inserts `https://youtu.be/<id>`
- **THEN** the iframe `src` is the embed URL for `<id>`

#### Scenario: Embed URL inserted directly

- **WHEN** the user inserts `https://www.youtube.com/embed/<id>`
- **THEN** the iframe `src` is `https://www.youtube.com/embed/<id>` with no duplicated `/embed/` segment

#### Scenario: Pasted YouTube link

- **WHEN** the user pastes a bare `https://www.youtube.com/watch?v=<id>` into the editor and the extension's paste handler creates a YouTube node
- **THEN** the iframe rendered for that node uses the embed URL

#### Scenario: Stored HTML loaded back into the editor

- **WHEN** the editor loads content containing `<div data-youtube-video><iframe src="https://www.youtube.com/embed/<id>"></iframe></div>`
- **THEN** the node is parsed as a YouTube node
- **AND** the iframe rendered in the editor uses the embed URL
- **AND** the video is playable

### Requirement: Editing view and serialized output agree

The embed URL rendered by the node view SHALL be derived using the same conversion and the same extension options that `renderHTML()` uses, so the player configured while editing matches the player in the saved HTML.

#### Scenario: nocookie option enabled

- **WHEN** the YouTube extension is configured with `nocookie: true` and a video is inserted
- **THEN** the in-editor iframe `src` host is `www.youtube-nocookie.com`
- **AND** `editor.getHTML()` emits the same host

#### Scenario: start time preserved

- **WHEN** a YouTube node has a non-zero `start` attribute
- **THEN** the in-editor iframe `src` carries the corresponding start parameter
- **AND** it matches the value in `editor.getHTML()`

#### Scenario: getHTML output is unchanged by this change

- **WHEN** a YouTube video is inserted and `editor.getHTML()` is called
- **THEN** the output contains `<div data-youtube-video>` wrapping an iframe whose `src` is the embed URL, exactly as before this change

### Requirement: Unconvertible src renders a visible warning placeholder

When the embed-URL conversion returns no result — an unrecognised, malformed, or tampered `src` — the node view SHALL NOT render an iframe, and SHALL render a visible warning placeholder in its place. The failure SHALL NOT be silent: an invisible or zero-size placeholder is not acceptable, because it is indistinguishable from the video having been dropped from the document.

#### Scenario: Non-YouTube src on a YouTube node

- **WHEN** a YouTube node's `src` attribute is not a recognisable YouTube URL
- **THEN** no `<iframe>` element is rendered for that node
- **AND** a visible placeholder is rendered containing warning text resolved through the widget's i18n layer
- **AND** the node remains selectable and deletable in the editor

#### Scenario: Placeholder shows the stored source for recovery

- **WHEN** the warning placeholder is rendered for a node whose `src` is `not-a-youtube-url`
- **THEN** the placeholder displays that stored `src` value as plain text
- **AND** the value is NOT rendered as a hyperlink or any other activatable element

#### Scenario: Placeholder preserves document layout

- **WHEN** a node with `width: 560` and `height: 314` fails conversion
- **THEN** the placeholder occupies the same 560×314 box the video would have occupied

#### Scenario: Placeholder is not resizable

- **WHEN** the warning placeholder is rendered
- **THEN** no resize handles are rendered for that node

### Requirement: The YouTube iframe exposes an accessible name and required permissions

The YouTube iframe SHALL carry a non-empty `title` attribute sourced from the widget's i18n resources, and an `allow` attribute granting the permissions the YouTube player needs.

#### Scenario: Accessible frame name

- **WHEN** a YouTube video is rendered in the editor
- **THEN** the iframe has a non-empty `title` attribute
- **AND** the title text is resolved through the widget's i18n layer, not hardcoded English

#### Scenario: Player permissions

- **WHEN** a YouTube video is rendered in the editor
- **THEN** the iframe has an `allow` attribute including at least `autoplay`, `encrypted-media`, `fullscreen`-equivalent (`allowfullscreen`), and `picture-in-picture`

### Requirement: Resizing continues to work and does not reload the player

Corner-handle resizing SHALL continue to update the node's `width`/`height` attributes, and SHALL NOT change the iframe `src` during or after a drag.

#### Scenario: Drag-resize keeps the same src

- **WHEN** the user drags a corner handle of a YouTube video
- **THEN** the iframe `src` is byte-identical before and after the drag
- **AND** the video does not reload or restart

#### Scenario: Resize persists dimensions

- **WHEN** the user finishes a corner-handle drag
- **THEN** the node's `width` and `height` attributes are updated to the new size
- **AND** the aspect ratio is preserved
