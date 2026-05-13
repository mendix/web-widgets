# Signature Widget

Canvas-based signature capture for Mendix web applications.

## Architecture

```
Signature.tsx (entry)
└─ SignatureComponent
   ├─ SizeContainer (responsive wrapper with flexible sizing)
   │  └─ useResizeObserver (from @mendix/widget-plugin-hooks)
   ├─ ValidationAlert (from @mendix/widget-plugin-component-kit)
   ├─ Grid (optional background grid)
   └─ canvas (drawing surface)
      └─ useSignaturePad (manages signature_pad lifecycle)
```

## Key Files

- `src/Signature.tsx` - Widget entry point
- `src/components/Signature.tsx` - Main component
- `src/components/SizeContainer.tsx` - Responsive container with dimension controls
- `src/components/Grid.tsx` - Optional background grid overlay
- `src/utils/useSignaturePad.ts` - Signature pad lifecycle hook
- `src/utils/dimensions.ts` - Dimension calculation utilities
- `src/utils/Utils.ts` - Filename generation and blob conversion
- `src/Signature.xml` - Widget properties for Studio Pro

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

## Properties

**Data:**

- `imageSource` (image) - Storage for signature
- `fileName` (textTemplate) - Custom filename (auto-generates if empty)
- `hasSignatureAttribute` (boolean) - Tracks if signed

**Appearance:**

- `penType` (enum) - fountain/ballpoint/marker
    - Fountain: variable width 0.6-2.6px, velocity-based
    - Ballpoint: consistent 1.4-1.5px
    - Marker: thick 2-4px
- `penColor` (string) - Hex, RGB, or color name

**Dimensions:**

- Width/height with flexible units (pixels, percentage, viewport)
- Min/max height constraints
- Overflow control

**Grid:**

- `showGrid` (boolean) - Display background grid
- Grid color, cell size, line width

**Events:**

- `onSignEndAction` - Triggered after each stroke with signature URI

## Key Behaviors

**Resize Handling:** Canvas preserves drawing during resize using `toData()`/`fromData()` from signature_pad

**Read-Only Mode:** Toggles via `signaturePad.on()`/`off()` when `imageSource.readOnly` changes

**Clear Signature:** Monitors `hasSignatureAttribute` value changes (true→false) to clear canvas

**Initialization Guard:** Only instantiates SignaturePad when `imageSource.status === "available"` to avoid re-renders

## Commands

```bash
cd packages/pluggableWidgets/signature-web
pnpm run build      # Production build
pnpm run dev        # Development build with watch
pnpm run start      # Start dev server
pnpm run test       # Unit tests
pnpm run lint       # ESLint
```

## Development

Set `MX_PROJECT_PATH` to your Mendix project, then `pnpm run dev` for hot reload. Changes appear in Studio Pro after sync.

## Marketplace

- **App Number:** 107984
- **Minimum Mendix:** 11.8.0
- **Offline Capable:** Yes
- **Platform:** Web only
