# Rich Text Widget - CSP Compliance Guide

## Overview

The Rich Text widget is now fully Content Security Policy (CSP) compliant. All inline styles have been replaced with CSS classes.

## Features

### 1. Data Format Options

Choose between two data storage formats:

- **HTML Format** (default): Stores content as HTML markup
- **Quill Delta Format**: Stores content as JSON, avoiding DOMParser for enhanced CSP compliance

Set via the `dataFormat` property in Studio Pro.

### 2. Class-Based Styling

All formatting now uses CSS classes instead of inline styles:

- ✅ Font families → `.ql-font-{name}`
- ✅ Font sizes → `.ql-size-{size}`
- ✅ Text colors → `.ql-color-{color}`
- ✅ Background colors → `.ql-bg-{color}`
- ✅ Text alignment → `.ql-align-{center|right|justify}`
- ✅ Text direction → `.ql-direction-{rtl}`
- ✅ Text indentation → `.ql-indent-{left|right}-{3,6,9...}`
- ✅ White-space control → `.ql-whitespace-{normal|pre|nowrap...}`
- ✅ List styles → `.ql-list-style-{disc|decimal|lower-alpha...}`
- ✅ Table borders → `.ql-table-bordered`

## Usage in External Applications

### For Viewing Rich Text Content Outside Mendix

If you're displaying Rich Text widget content in an external application (e.g., static website, mobile app, email), you need to include the CSS classes for proper rendering.

#### Option 1: Import the SCSS file (recommended)

```scss
@import "@mendix/rich-text-web/src/utils/formats/quill-class-attributors.scss";
```

#### Option 2: Copy the compiled CSS

After building the widget, copy the compiled CSS from:

```
dist/tmp/widgets/com/mendix/widget/custom/richtext/quill-class-attributors.css
```

Include it in your application's stylesheet.

#### Option 3: CDN (if available)

```html
<link rel="stylesheet" href="path/to/quill-class-attributors.css" />
```

## CSP Policy Configuration

The widget now works with strict CSP policies:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self';
```

### What's No Longer Needed:

- ❌ `'unsafe-inline'` for `style-src` (all inline styles removed)
- ❌ `'unsafe-eval'` (when using Quill Delta format)

### What's Still Allowed:

- ✅ JavaScript style manipulation (`element.style.setProperty()`) - used by table resizing
- ✅ Dynamic CSS injection for custom colors (hex values)

## Custom Colors

When users select custom colors (hex values like `#ff5733`), the widget dynamically creates CSS classes:

```css
.ql-color-ff5733 {
    color: #ff5733;
}
.ql-bg-ff5733 {
    background-color: #ff5733;
}
```

**Note**: Custom color injection uses dynamic `<style>` elements, which requires:

```
style-src 'self' 'unsafe-inline';
```

To achieve **100% strict CSP** without `'unsafe-inline'`, restrict users to predefined colors only by customizing the color picker palette.

## Custom Fonts

Custom fonts configured in the widget properties are also injected dynamically:

```css
.widget-rich-text .ql-font-custom-name {
    font-family: "Custom Font", sans-serif;
}
```

## Migration Guide

### From StyleAttributor to ClassAttributor

If you have existing Rich Text content, no action is needed. The widget automatically:

1. Detects the format of stored data (HTML vs Quill Delta)
2. Converts inline styles to CSS classes when rendering
3. Maintains backward compatibility with old content

### Switching Data Formats

When switching from HTML to Quill Delta format (or vice versa):

1. Change the `dataFormat` property in Studio Pro
2. The widget automatically detects and converts the data
3. After the first save, data is stored in the new format

## Troubleshooting

### Content displays without formatting

**Cause**: External CSS not loaded

**Solution**: Ensure `quill-class-attributors.css` is included in your application

### CSP errors in console

**Cause**: Strict CSP blocking dynamic style injection

**Solution**: Allow `'unsafe-inline'` for `style-src` only if you need custom colors. Alternatively, pre-define all colors in your CSS and restrict the color picker palette.

### Custom fonts not working

**Cause**: Font files not loaded or custom font CSS not injected

**Solution**: Ensure font files are accessible and the widget has permission to inject styles

## Technical Details

### File Structure

- `quill-class-attributors.scss` - External CSS file with all class definitions
- `fonts.scss` - Internal widget styles (includes quill-class-attributors.scss)
- `color.ts` - Custom color attributors with dynamic CSS injection
- `fontsize.ts` - Font size attributor configuration

### Class Naming Convention

All classes follow the pattern: `ql-{format}-{value}`

Examples:

- `ql-font-arial`
- `ql-size-16px`
- `ql-color-red`
- `ql-bg-yellow`
- `ql-indent-left-6`

## Support

For issues or questions, please report them at:
https://github.com/mendix/web-widgets/issues
