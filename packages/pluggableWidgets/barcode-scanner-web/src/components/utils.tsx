import {
    BinaryBitmap,
    BrowserMultiFormatReader,
    HTMLCanvasElementLuminanceSource,
    HybridBinarizer,
    BarcodeFormat,
    DecodeHintType,
    Result
} from "@zxing/library";
import { BarcodeFormatsType } from "typings/BarcodeScannerProps";

export const returnVideoWidthHeight = (
    curVideoRef: HTMLVideoElement,
    canvasMiddle: HTMLDivElement
): { width: number; height: number } => {
    const aspectRatioClient = curVideoRef.clientWidth / curVideoRef.clientHeight;
    const aspectRatioVideo = curVideoRef.videoWidth / curVideoRef.videoHeight;

    let videoCropWidth = (canvasMiddle.clientWidth / curVideoRef.clientWidth) * curVideoRef.videoWidth;
    let videoCropHeight = (canvasMiddle.clientHeight / curVideoRef.clientHeight) * curVideoRef.videoHeight;

    if (aspectRatioVideo < aspectRatioClient) {
        videoCropHeight = videoCropWidth;
    } else {
        videoCropWidth = videoCropHeight;
    }
    return { width: videoCropWidth, height: videoCropHeight };
};

export const drawCropOnCanvas = (
    captureCanvas: HTMLCanvasElement,
    videoRef: HTMLVideoElement,
    canvasMiddle: HTMLDivElement
): HTMLCanvasElement => {
    const canvasContext = captureCanvas.getContext("2d", { willReadFrequently: true });
    const videoWidthHeight = returnVideoWidthHeight(videoRef, canvasMiddle);
    if (
        Math.abs(captureCanvas.width - videoWidthHeight.width) > 1 ||
        Math.abs(captureCanvas.height - videoWidthHeight.height) > 1
    ) {
        captureCanvas.width = videoWidthHeight.width;
        captureCanvas.height = videoWidthHeight.height;
    }
    if (canvasContext !== null && videoRef !== null) {
        canvasContext.drawImage(
            videoRef,
            (videoRef.videoWidth - videoWidthHeight.width) / 2,
            (videoRef.videoHeight - videoWidthHeight.height) / 2,
            videoWidthHeight.width,
            videoWidthHeight.height,
            0,
            0,
            videoWidthHeight.width,
            videoWidthHeight.height
        );
    }
    return captureCanvas;
};

export const decodeCanvas = (reader: BrowserMultiFormatReader, captureCanvas: HTMLCanvasElement): Result => {
    const luminanceSource = new HTMLCanvasElementLuminanceSource(captureCanvas);

    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
    const result = reader.decodeBitmap(binaryBitmap);
    return result;
};

export const createHints = (
    useAllFormats: boolean,
    barcodeFormats?: BarcodeFormatsType[]
): Map<DecodeHintType, any> => {
    const hints = new Map();
    let formats: BarcodeFormat[] = [];
    if (useAllFormats) {
        formats = [
            BarcodeFormat.UPC_A,
            BarcodeFormat.UPC_E,
            BarcodeFormat.EAN_8,
            BarcodeFormat.EAN_13,
            BarcodeFormat.CODE_39,
            BarcodeFormat.CODE_128,
            BarcodeFormat.ITF,
            BarcodeFormat.RSS_14,
            BarcodeFormat.QR_CODE,
            BarcodeFormat.DATA_MATRIX,
            BarcodeFormat.AZTEC,
            BarcodeFormat.PDF_417
        ];
    } else {
        if (barcodeFormats) {
            formats = barcodeFormats.map(val => BarcodeFormat[val.barcodeFormat]);
        }
    }
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    hints.set(DecodeHintType.ENABLE_CODE_39_EXTENDED_MODE, true);
    return hints;
};
