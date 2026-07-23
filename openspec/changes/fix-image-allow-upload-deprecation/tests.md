- [x] **Container renders the bound image when imageObject is Available**
    - **Type:** unit
    - **Given:** `ImageContainerProps` with `datasource: "image"`, `imageObject` as an `EditableImageValue<ImageValue>`-shaped object with `status: ValueStatus.Available` and `value.uri: "https://example.com/a.png"`
    - **When:** `Image` (src/Image.tsx container) is rendered
    - **Then:** the rendered `<img>` `src` equals `"https://example.com/a.png"`

- [x] **Container falls back to defaultImageDynamic when imageObject is Unavailable**
    - **Type:** unit
    - **Given:** `imageObject` with `status: ValueStatus.Unavailable`, `defaultImageDynamic` as `EditableImageValue<ImageValue>`-shaped with `status: ValueStatus.Available` and `value.uri: "https://example.com/default.png"`
    - **When:** `Image` is rendered
    - **Then:** the rendered `<img>` `src` equals `"https://example.com/default.png"`

- [x] **Container renders nothing bound when both imageObject and defaultImageDynamic are unavailable**
    - **Type:** unit
    - **Given:** `imageObject` with `status: ValueStatus.Unavailable`, `defaultImageDynamic` undefined
    - **When:** `Image` is rendered
    - **Then:** the rendered image element has no meaningful `src` (placeholder/empty state), matching current behavior before this change
