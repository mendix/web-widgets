## Why

The Rich Text image dialog always renders all three source tabs (URL, Upload, Media Library/entity), even when the widget is configured so a mode is unavailable. The entity tab appears with no data source behind it, and the upload tab appears even when the app maker disabled default upload. Tabs should reflect the widget configuration.

## What Changes

- Hide the **Entity** ("Media Library") tab when no image data source is configured (`imageSource` is null/undefined).
- Hide the **Upload** tab when `enableDefaultUpload` is `false`.
- The **URL** tab is always shown; at least two tabs are always present (enforced by existing `RichText.editorConfig.ts` gating).
- Move the image dialog configuration (`imageSourceContent`, `enableDefaultUpload`, and a derived "has image source" flag) into `EditorContext` so `ImageDialog` reads it directly, removing the existing multi-hop prop drilling of `imageSourceContent` through Toolbar → ToolbarRow → Dialog.

## Capabilities

### New Capabilities

- `rich-text-image-dialog`: Configuration-driven visibility of the image source tabs (URL / Upload / Entity) in the Rich Text image insertion dialog.

### Modified Capabilities

<!-- No existing specs; nothing to modify. -->

## Impact

- **Widget**: `packages/pluggableWidgets/rich-text-web`
- **Files**: `EditorContext.tsx`, `Editor.tsx`, `EditorWrapper.tsx`, `Toolbar.tsx`, `components/toolbars/components/Dialog.tsx`, `components/toolbars/components/ImageDialog.tsx`, `components/toolbars/helpers/toolbarTypes.ts`
- **Behavior**: End-user visible change in the image dialog (fewer tabs in some configurations). No XML/schema change; no breaking API change.
- **Tests**: Unit tests for tab visibility across configurations; existing ImageDialog/RichText tests updated for the context-based prop delivery.
