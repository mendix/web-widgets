# Signature Widget

Canvas-based signature capture for Mendix web applications.

## Dependencies

**Core:** `signature_pad` v5.1.3 - Canvas-based signature drawing with touch/mouse support

**Mendix Plugins:**

- `@mendix/widget-plugin-component-kit` - ValidationAlert, If
- `@mendix/widget-plugin-hooks` - useResizeObserver
- `classnames` - CSS class composition

## Data Flow

1. User draws on canvas → `signature_pad` fires `endStroke` event
2. Hook converts canvas to data URL (PNG)
3. Image saved to `imageSource` attribute via `setValue()`
4. Optional `hasSignatureAttribute` boolean updated
5. Optional `onSignEndAction` triggered with signature URI parameter

## Key Behaviors

**Resize Handling:** Canvas preserves drawing during resize using `toData()`/`fromData()` from signature_pad

**Read-Only Mode:** Toggles via `signaturePad.on()`/`off()` when `imageSource.readOnly` changes

**Clear Signature:** Monitors `hasSignatureAttribute` value changes (true→false) to clear canvas

**Initialization Guard:** Only instantiates SignaturePad when `imageSource.status === "available"` to avoid re-renders
