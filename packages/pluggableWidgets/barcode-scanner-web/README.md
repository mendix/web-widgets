# Barcode Scanner

The widget lets you scan a barcode

## Overview

- **Folder**: `barcode-scanner-web`
- **Category**: Images, videos & files
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/barcode-scanner)

## XML Properties

### General

- **Scanned result** (`datasource`; type: attribute, required). The String attribute used to store the result of the scanned barcode. Attribute types: String.
- **Show barcode mask** (`showMask`; type: boolean, required, default: true). Apply a mask to camera view, as a specific target area for the barcode.
- **Use all barcode formats** (`useAllFormats`; type: boolean, required, default: true). Scan for all available barcode formats
- **Enabled barcode formats** (`barcodeFormats`; type: object, list).
- **Barcode format** (`barcodeFormat`; type: enumeration, default: AZTEC). Barcode format which should be recognized by the scanner Allowed values: `AZTEC` (Aztec), `CODE_39` (Code 39), `CODE_128` (Code 128), `DATA_MATRIX` (Data Matrix), `EAN_8` (EAN-8), `EAN_13` (EAN-13), `ITF` (ITF), `PDF_417` (PDF 417), `QR_CODE` (QR Code), `RSS_14` (RSS-14), `UPC_A` (UPC-A), `UPC_E` (UPC-E).

### Events

- **On detect action** (`onDetect`; type: action, optional). Action to trigger when the barcode has been successfully detected.

### Common

- **Name**. Standard Mendix system property.
- **Visibility**. Standard Mendix system property.

### Dimensions

- **Width unit** (`widthUnit`; type: enumeration, default: percentage). Percentage: portion of parent size. Pixels: absolute amount of pixels. Allowed values: `percentage` (Percentage), `pixels` (Pixels).
- **Width** (`width`; type: integer, default: 100).
- **Height unit** (`heightUnit`; type: enumeration, default: percentageOfWidth). Allowed values: `percentageOfWidth` (Percentage of width), `pixels` (Pixels), `percentageOfParent` (Percentage of parent).
- **Height** (`height`; type: integer, default: 75).

- **Detection logic** (`detectionLogic`; type: enumeration, default: native). Choose the detection logic to use for barcode scanning. Allowed values: `zxing` (ZXing), `native` (BarcodeDetector API (experimental fast scan, fallback to ZXing)).
