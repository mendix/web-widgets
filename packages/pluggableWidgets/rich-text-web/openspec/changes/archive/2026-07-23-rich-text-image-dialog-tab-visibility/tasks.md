## 1. Extend EditorContext with image configuration

- [x] 1.1 Add `ImageDialogConfig` type (`imageSourceContent?: ReactNode`, `enableDefaultUpload: boolean`, `hasImageSource: boolean`) and add `imageConfig: ImageDialogConfig` to `EditorContextValue` in `components/EditorContext.tsx`
- [x] 1.2 Update `EditorContextProvider` to accept an `imageConfig` prop and pass it into the context value

## 2. Feed configuration from the editor down to the provider

- [x] 2.1 In `components/EditorWrapper.tsx`, destructure `imageSource` and `enableDefaultUpload` from props and forward them to `Editor`
- [x] 2.2 In `components/Editor.tsx`, add `imageSource` and `enableDefaultUpload` to the `Pick<RichTextContainerProps>` types (`EditorProps`) and thread them to where the provider is rendered
- [x] 2.3 In `components/Editor.tsx`, build `imageConfig` (deriving `hasImageSource = imageSource != null`) and pass it to `EditorContextProvider`

## 3. Remove imageSourceContent prop drilling

- [x] 3.1 Remove `imageSourceContent` from `EditorInnerProps` and the `<Toolbar>` call in `components/Editor.tsx`
- [x] 3.2 Remove `imageSourceContent` from `ToolbarProps`, `ToolbarRow`, and the `DialogToolbarButton` usage in `components/toolbars/Toolbar.tsx`
- [x] 3.3 Remove `imageSourceContent` from `DialogToolbarButtonProps` and the `<ImageDialog>` call in `components/toolbars/components/Dialog.tsx`
- [x] 3.4 Remove `imageSourceContent` from `ImageDialogProps` in `components/toolbars/helpers/toolbarTypes.ts`

## 4. Conditional tab rendering in ImageDialog

- [x] 4.1 In `components/toolbars/components/ImageDialog.tsx`, read `imageConfig` from `useCurrentEditor()` instead of the `imageSourceContent` prop
- [x] 4.2 Render the Upload tab button and its content only when `enableDefaultUpload` is `true`
- [x] 4.3 Render the Entity tab button and its content only when `hasImageSource` is `true`, using `imageConfig.imageSourceContent`

## 5. Tests and verification

- [x] 5.1 Add/adjust unit tests covering the three configurations (no image source; upload disabled; all sources) asserting which tab buttons are rendered
- [x] 5.2 Update existing `ImageDialog`/`RichText` tests to supply configuration via `EditorContext` instead of the removed prop
- [x] 5.3 Run `pnpm run test` and `pnpm run lint` in `packages/pluggableWidgets/rich-text-web` and fix failures
