# BarcodeDetector API Integration

This document describes the integration of the native BarcodeDetector API with the barcode scanner widget.

## Overview

The barcode scanner widget now supports both the native BarcodeDetector API (when available) and the @zxing/library as a fallback. This provides:

- **Better Performance**: Native API is typically faster than JavaScript libraries
- **Smaller Bundle Size**: Reduced dependency on external libraries when native support is available
- **Forward Compatibility**: Leverages modern browser capabilities
- **Graceful Degradation**: Automatic fallback to @zxing/library ensures compatibility

## Browser Support

The BarcodeDetector API is currently supported in:
- Chrome 83+
- Edge 83+
- Android Chrome 83+

The widget automatically detects browser support and falls back to @zxing/library in unsupported browsers.

## Implementation Details

### Feature Detection
```typescript
export const isBarcodeDetectorSupported = (): boolean => {
    return typeof window !== "undefined" && "BarcodeDetector" in window;
};
```

### Detection Flow
1. **BarcodeDetector API**: Try native API first if supported
2. **@zxing/library Fallback**: Use existing implementation if native API fails or is unavailable
3. **Console Logging**: Track which detection method is being used for debugging

### Supported Formats

The BarcodeDetector API supports these formats (mapped from Mendix widget configuration):
- UPC-A → upc_a
- UPC-E → upc_e  
- EAN-8 → ean_8
- EAN-13 → ean_13
- Code 39 → code_39
- Code 128 → code_128
- ITF → itf
- QR Code → qr_code
- Data Matrix → data_matrix
- Aztec → aztec
- PDF417 → pdf417

## Configuration

No additional configuration is required. The widget automatically:
- Detects BarcodeDetector API availability
- Maps format configurations between APIs
- Handles both cropped and non-cropped scanning modes
- Provides the same interface regardless of detection method

## Testing

The implementation includes comprehensive unit tests for:
- Feature detection
- Format mapping
- Error handling
- Fallback behavior

Run tests with:
```bash
pnpm test
```

## Performance Considerations

- Native BarcodeDetector API typically provides better performance
- Memory usage is reduced when native API is available
- Bundle size impact is minimal (only TypeScript definitions added)
- No breaking changes to existing functionality