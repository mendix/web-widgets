# Barcode Generator

Generate barcodes and QR codes from a string input

## Overview

- **Folder**: `barcode-generator-web`
- **Category**: Display
- **Offline capable**: Yes

## XML Properties

### Data source

- **Dynamic value** (`codeValue`; type: expression, required). String to encode as a barcode or QR code Returns: String.
- **Barcode Format** (`codeFormat`; type: enumeration, required, default: CODE128). Choose between QR or other barcode types Allowed values: `CODE128` (Barcode), `QRCode` (QR Code), `DataMatrix` (Data Matrix), `Custom` (Custom).
- **Empty message** (`emptyMessage`; type: textTemplate, optional).
- **Allow download** (`allowDownload`; type: boolean, default: false). Adds a download button
- **Button text** (`downloadButtonCaption`; type: textTemplate, optional).
- **Button aria-label** (`downloadButtonAriaLabel`; type: textTemplate, optional).
- **File name** (`downloadFileName`; type: textTemplate, optional). Custom filename for the downloaded file (without extension). If empty, generates automatically based on format and value.
- **Button position** (`buttonPosition`; type: enumeration, required, default: bottom). Position of the download button relative to the barcode Allowed values: `top` (Top), `bottom` (Bottom).

### Advanced Barcode Settings

- **Custom Format** (`customCodeFormat`; type: enumeration, required, default: CODE128). Choose between barcode types format Allowed values: `CODE128` (CODE128), `EAN13` (EAN-13), `EAN8` (EAN-8), `UPC` (UPC), `CODE39` (CODE39), `ITF14` (ITF-14), `MSI` (MSI), `pharmacode` (Pharmacode), `codabar` (Codabar), `CODE93` (CODE93).
- **EAN-128** (`enableEan128`; type: boolean, default: false). Enable encoding CODE128 as GS1-128/EAN-128
- **Flat** (`enableFlat`; type: boolean, default: false). Enable flat barcode, skip guard bars. Note: Doesn't work with EAN addons.
- **Last character** (`lastChar`; type: string, optional). Character after the barcode. Note: Doesn't work when 'Flat' is enabled or with EAN addons.
- **Mod43** (`enableMod43`; type: boolean, required, default: false). For code 39 if used with modulo 43 check digit

### EAN Addons

- **Addon format** (`addonFormat`; type: enumeration, required, default: None). Choose between EAN-5 or EAN-2 addon format Allowed values: `None` (None), `EAN5` (EAN-5), `EAN2` (EAN-2).
- **Addon value** (`addonValue`; type: expression, required). Value for the addon barcode (5 digits for EAN-5, 2 digits for EAN-2) Returns: String.
- **Addon spacing** (`addonSpacing`; type: integer, required, default: 20). Space between main barcode and addon (in pixels)

### Advanced QR Code Settings

- **Level** (`qrLevel`; type: enumeration, required, default: L). The Error Correction Level to use Allowed values: `L` (L), `M` (M), `Q` (Q), `H` (H).
- **QR Size** (`qrSize`; type: integer, required, default: 128). The size of the QR box. Note: In preview, the max height is 200px. The QR code will render at full size in your application.

### Advanced Data Matrix Settings

- **GS1 Data Matrix** (`dmGs1Mode`; type: boolean, default: false). Encode as GS1 Data Matrix (FNC1 + Application Identifiers), e.g. (01)09501101020917(17)261231(10)ABC123. Used for pharma serialization.
- **Symbol shape** (`dmShape`; type: enumeration, required, default: square). Choose square or rectangular Data Matrix symbol shape Allowed values: `square` (Square), `rectangle` (Rectangle).
- **Data Matrix size** (`dmSize`; type: integer, required, default: 128). The size of the Data Matrix symbol in pixels. Note: In preview, the max height is 200px. The symbol will render at full size in your application.

### Development

- **Log Level** (`logLevel`; type: enumeration, required, default: None). Choose the log level for in the case of failure for generating the barcode. Info will display generic error message on the UI and Debug will gives detailed information on the developer console. Allowed values: `None` (None), `Info` (Info), `Debug` (Debug).

### Display

- **Display value** (`displayValue`; type: boolean, default: false). Display the value below the code
- **Show as card** (`showAsCard`; type: boolean, default: false). Display the widget with a border, background and padding
- **Bar width** (`codeWidth`; type: integer, required, default: 2). Width of a single bar
- **Code height** (`codeHeight`; type: integer, required, default: 200). Height of the barcode. Note: In preview, the max height is 200px. The barcode will render at full height in your application.
- **Margin size** (`codeMargin`; type: integer, required, default: 2). In pixels
- **Margin size** (`qrMargin`; type: integer, required, default: 2). Number of module units (QR grid cells) to use for margin. Increasing compresses the QR pattern within the fixed size. Note: not visible in preview.
- **Margin size** (`dmMargin`; type: integer, required, default: 2). Number of module units (Data Matrix cells) to use for the quiet zone. Increasing compresses the symbol within the fixed size. Keep at least 1 to stay scannable. Note: not visible in preview.
- **Title** (`qrTitle`; type: textTemplate, required). Used for accessibility
- **Show title** (`showTitle`; type: boolean, default: false). Display title on top of QR Code
- **Overlay image** (`qrOverlay`; type: boolean, required, default: false). Include an image overlay on the QR code

### QR Overlay Settings

- **Image source** (`qrOverlaySrc`; type: image, required). URL or path to the image to display on the QR code
- **Center image** (`qrOverlayCenter`; type: boolean, required, default: true). Center the image in the QR code
- **Image X position** (`qrOverlayX`; type: integer, required, default: 0). Horizontal position of the image
- **Image Y position** (`qrOverlayY`; type: integer, required, default: 0). Vertical position of the image
- **Image height** (`qrOverlayHeight`; type: integer, required, default: 24). Height of the image in pixels
- **Image width** (`qrOverlayWidth`; type: integer, required, default: 24). Width of the image in pixels
- **Image opacity** (`qrOverlayOpacity`; type: decimal, required, default: 1). Opacity of the image (0.0 to 1.0)
- **Excavate background** (`qrOverlayExcavate`; type: boolean, required, default: true). Remove QR code dots behind the image

## Additional Notes

<!-- Please see [Barcode Generator](https://docs.mendix.com/appstore/widgets/barcode-generator) in the Mendix documentation for details. -->
