// TypeScript definitions for the BarcodeDetector API
// Based on https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector

// https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API#supported_barcode_formats
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
    cornerPoints: ReadonlyArray<{ x: number; y: number }>;
    format: BarcodeFormat["format"];
    rawValue: string;
}

export interface BarcodeDetectorOptions {
    formats?: Array<BarcodeFormat["format"]>;
}

export interface BarcodeDetector {
    detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
    getSupportedFormats(): Promise<Array<BarcodeFormat["format"]>>;
}

export type BarcodeDetectorConstructor = new (options?: BarcodeDetectorOptions) => BarcodeDetector;

// Extend Window interface to include BarcodeDetector
declare global {
    interface Window {
        BarcodeDetector?: BarcodeDetectorConstructor;
    }
}

export interface MxBarcodeReader {
    start(onSuccess: (data: string) => void, onError: (e: Error) => void): Promise<void>;
    stop(): void;
}
