## Context

The Rich Text widget's image dialog (`ImageDialog.tsx`) hardcodes three tabs: URL, Upload, and Entity ("Media Library"). All three always render. The widget already gates configuration in `RichText.editorConfig.ts`: `imageSourceContent` and `enableDefaultUpload` are only available when `imageSource` is set, and `enableDefaultUpload` defaults to `true`. This guarantees at least two tabs are always valid (URL is unconditional).

Today `imageSourceContent` is drilled from the container through `EditorWrapper → Editor → EditorInner → Toolbar → ToolbarRow → DialogToolbarButton → ImageDialog`. The two additional signals needed for tab visibility (`enableDefaultUpload`, and whether `imageSource` is present) would follow the same path if added as props.

`EditorContext` already reaches `ImageDialog` — the dialog calls `useCurrentEditor()`. The provider is created in `Editor.tsx` and currently carries only `{ editor, codeViewState, codeViewDispatch }`.

## Goals / Non-Goals

**Goals:**

- Hide the Entity tab when `imageSource` is not configured.
- Hide the Upload tab when `enableDefaultUpload` is `false`.
- Avoid prop drilling by delivering image dialog configuration through `EditorContext`.
- Remove the existing multi-hop drilling of `imageSourceContent`.

**Non-Goals:**

- Changing the editor-config gating logic in `RichText.editorConfig.ts` (already enforces the ≥2-tab invariant).
- Changing XML schema, property keys, or the URL/Upload/Entity behaviors themselves.
- Handling a "zero tabs" or "URL hidden" case (not possible under current gating).

## Decisions

**Decision: Extend `EditorContext` with an `imageConfig` block.**
The context value gains `imageConfig: { imageSourceContent?: ReactNode; enableDefaultUpload: boolean; hasImageSource: boolean }`. `ImageDialog` reads it via `useCurrentEditor()`.
_Alternative considered_: add a separate dedicated context/provider higher in the tree (e.g. at `RichText.tsx`). Rejected — `EditorContext` already spans the needed range and is already consumed by `ImageDialog`; a second provider adds surface area for no benefit.

**Decision: Derive `hasImageSource` at the feed point, not pass raw `ListValue` down.**
Compute `hasImageSource = imageSource != null` where the provider is fed (in `Editor`), keeping `ImageDialog` presentational and free of Mendix runtime types.
_Alternative considered_: key visibility off `imageSourceContent != null`. Equivalent under current gating, but `imageSource` matches the stated product intent and is the true source of truth.

**Decision: Remove `imageSourceContent` from the toolbar prop chain.**
Fold `imageSourceContent` into `imageConfig`, deleting it from `ImageDialogProps`, `DialogToolbarButtonProps`, `ToolbarProps`, `ToolbarRow`, and `EditorInnerProps`. This reduces net prop drilling even while adding two new signals.

**Decision: Feed the provider from `Editor`.**
`Editor`'s `Pick<RichTextContainerProps>` adds `imageSource` and `enableDefaultUpload`; `EditorWrapper` forwards them (it already holds full container props). This is a 3-hop feed (`RichText → EditorWrapper → Editor`) that is unavoidable — a context must be fed somewhere — but eliminates the deeper 5-hop consume path.

**Decision: Keep `activeTab` default of `"url"`.**
URL is always rendered, so the default active tab is always valid; no reset logic for hidden tabs is required.

## Risks / Trade-offs

- **Provider returns `null` while editor loads** → No new race: `ImageDialog` only mounts under a live editor, after the provider is established.
- **Existing tests pass `imageSourceContent` as a prop** → Update tests to provide it via context; treat as part of this change.
- **Future config where URL could be hidden** → Out of scope; current gating guarantees URL is always present, so no zero/one-tab handling is added.
