import { BarcodeFormatsType } from "../../typings/BarcodeScannerProps";
import type { BarcodeDetector, BarcodeDetectorOptions, BarcodeFormat, DetectedBarcode } from "./barcode-detector";

// Map Mendix barcode format types to native BarcodeDetector format strings
const mapToNativeFormat = (format: string): string => {
    const formatMap: Record<string, string> = {
        UPC_A: "upc_a",
        UPC_E: "upc_e",
        EAN_8: "ean_8",
        EAN_13: "ean_13",
        CODE_39: "code_39",
        CODE_128: "code_128",
        ITF: "itf",
        QR_CODE: "qr_code",
        DATA_MATRIX: "data_matrix",
        AZTEC: "aztec",
        PDF_417: "pdf417"
    };
    return formatMap[format] || format.toLowerCase();
};

// Check if BarcodeDetector API is available
export const isBarcodeDetectorSupported = (): boolean => {
    return typeof globalThis !== "undefined" && "BarcodeDetector" in globalThis;
};

// Get supported formats for BarcodeDetector
export const getBarcodeDetectorSupportedFormats = async (): Promise<string[]> => {
    if (!isBarcodeDetectorSupported()) {
        return [];
    }
    try {
        const detector = new window.BarcodeDetector!();
        return await detector.getSupportedFormats();
    } catch (error) {
        console.warn("Failed to get BarcodeDetector supported formats:", error);
        return [];
    }
};

// Create BarcodeDetector options from widget configuration
export const createBarcodeDetectorOptions = (
    useAllFormats: boolean,
    barcodeFormats?: BarcodeFormatsType[]
): BarcodeDetectorOptions => {
    const options: BarcodeDetectorOptions = {};

    if (!useAllFormats && barcodeFormats && barcodeFormats.length > 0) {
        options.formats = barcodeFormats.map(format => mapToNativeFormat(format.barcodeFormat)) as Array<
            BarcodeFormat["format"]
        >;
    }
    // If useAllFormats is true or no specific formats, don't specify formats to use all supported

    return options;
};

// Create BarcodeDetector instance
export const createBarcodeDetector = (options?: BarcodeDetectorOptions): BarcodeDetector | null => {
    if (!isBarcodeDetectorSupported()) {
        return null;
    }

    try {
        return new window.BarcodeDetector!(options);
    } catch (error) {
        console.warn("Failed to create BarcodeDetector:", error);
        return null;
    }
};

// Detect barcodes from video or canvas element using BarcodeDetector API
export const detectBarcodesFromElement = async (
    detector: BarcodeDetector | null,
    element: HTMLVideoElement | HTMLCanvasElement | null
): Promise<DetectedBarcode[]> => {
    try {
        if (!detector || !element || (element as HTMLVideoElement).readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            return [];
        }
        return await detector.detect(element);
    } catch (error) {
        console.warn("BarcodeDetector failed to detect:", (element as HTMLVideoElement).readyState, error);
        return [];
    }
};

// Convert video frame to canvas for processing
export const captureVideoFrame = (video: HTMLVideoElement, canvas?: HTMLCanvasElement): HTMLCanvasElement => {
    if (!canvas) {
        canvas = document.createElement("canvas");
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    return canvas;
};

export const setupVideoElement = (video: HTMLVideoElement, stream: MediaStream): void => {
    video.autofocus = true;
    video.playsInline = true; // Fix error in Safari
    video.muted = true;
    video.srcObject = stream;
};
