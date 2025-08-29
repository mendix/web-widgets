// TypeScript definitions for the BarcodeDetector API
// Based on https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector

export interface BarcodeFormat {
    format: 
        | "aztec"
        | "code_128" 
        | "code_39"
        | "code_93"
        | "codabar"
        | "data_matrix"
        | "ean_13"
        | "ean_8"
        | "itf"
        | "pdf417"
        | "qr_code"
        | "unknown"
        | "upc_a"
        | "upc_e";
}

export interface DetectedBarcode {
    boundingBox: DOMRectReadOnly;
    cornerPoints: ReadonlyArray<{x: number, y: number}>;
    format: BarcodeFormat["format"];
    rawValue: string;
}

export interface BarcodeDetectorOptions {
    formats?: BarcodeFormat["format"][];
}

export interface BarcodeDetector {
    detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
    getSupportedFormats(): Promise<BarcodeFormat["format"][]>;
}

export interface BarcodeDetectorConstructor {
    new (options?: BarcodeDetectorOptions): BarcodeDetector;
}

// Extend Window interface to include BarcodeDetector
declare global {
    interface Window {
        BarcodeDetector?: BarcodeDetectorConstructor;
    }
}