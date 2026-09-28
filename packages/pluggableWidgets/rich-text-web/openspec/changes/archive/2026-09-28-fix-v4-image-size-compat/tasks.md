## 1. Dimension conversion helpers

- [x] 1.1 Create `src/utils/imageSize.ts` with `toCssLength(value: string | number | null | undefined): string | undefined` — digits only becomes `${value}px`, values with a unit or `%` pass through, empty/null becomes `undefined`
- [x] 1.2 Add `toHtmlDimension(value: string | number | null | undefined): string | undefined` — digits only passes through, digits + `px` drops the suffix, `%` passes through, any other unit or keyword becomes `undefined`
- [x] 1.3 Add `src/utils/__tests__/imageSize.spec.ts` covering the table in `design.md` for both functions, including `"300.5"`, `"auto"`, `"20em"`, `null` and `""`

## 2. Node view renders a CSS length

- [x] 2.1 In `src/components/ImageResize.tsx`, pass the `useState` seed for `size` through `toCssLength`, keeping `"auto"` as the fallback when there is no stored value
- [x] 2.2 Pass the `node.attrs` sync effect's `nextSize` through `toCssLength` as well, so an external attribute update (undo, `setContent`) also renders correctly
- [x] 2.3 Pass the `.image-container` and `<img>` `style` dimensions through `toCssLength` (or use the already-converted `size` state, if 2.1/2.2 cover every path)
- [x] 2.4 Leave the resize drag path unchanged — it measures with `getBoundingClientRect()` and already writes `px`

## 3. Serialization

- [x] 3.1 In `src/extensions/ImageResize.ts`, run the `width` `renderHTML` value through `toHtmlDimension` and omit the attribute when the result is `undefined`
- [x] 3.2 Do the same for `height`
- [x] 3.3 Leave `parseHTML` untouched, so loading content never rewrites the stored value

## 4. Tests

- [x] 4.1 Add `src/extensions/__tests__/ImageResize.spec.ts` building a real `Editor` with `StarterKit` + `ImageResize`
- [x] 4.2 Test: v4 `<img src="a.png" width="300" height="200">` parses to `"300"`/`"200"` and serializes back to `width="300" height="200"`
- [x] 4.3 Test: v5 `<img src="a.png" width="300px">` serializes to `width="300"`
- [x] 4.4 Test: `<img src="a.png" style="width:300px;height:200px">` serializes to `width="300" height="200"` and no inline `style`
- [x] 4.5 Test: a `50%` width survives as `width="50%"`; a `20em` width produces no `width` attribute
- [x] 4.6 Test: an image with no size produces neither attribute
- [x] 4.7 Add a node view test (RTL, rendering the `ImageResize` component with a stubbed `NodeViewProps`) asserting the `<img>` inline style width is `300px` for a stored `"300"`, for a stored `"300px"`, and `auto` when unset
- [x] 4.8 Run `pnpm run test` and confirm no existing suite regresses

## 5. Manual testing

- [ ] 5.1 Open a page whose attribute holds v4 content with a resized image — image keeps its v4 size in the editor
- [ ] 5.2 Same content with the widget read-only — image keeps its v4 size
- [ ] 5.3 Resize that v4 image — drag starts from the rendered size, result looks right, size persists after a page reload
- [ ] 5.4 Insert a new image via the dialog with Width 300 — renders 300px, and the saved HTML has `width="300"`
- [ ] 5.5 Open existing v5 content with `width="300px"` — unchanged on screen, `width="300"` after the next save
- [ ] 5.6 Check the read-only ("Read panel") mode and fullscreen mode for the same content

## 6. Documentation

- [x] 6.1 Add `CHANGELOG.md` entry under `## [Unreleased]` → `### Fixed`: images resized in Rich Text 4 keep their size after upgrading to version 5
