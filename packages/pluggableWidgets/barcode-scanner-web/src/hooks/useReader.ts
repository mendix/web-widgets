import { useEffect, useRef, RefObject } from "react";
import {
    BarcodeFormat,
    BinaryBitmap,
    BrowserMultiFormatReader,
    DecodeHintType,
    HTMLCanvasElementLuminanceSource,
    HybridBinarizer,
    NotFoundException,
    Result
} from "@zxing/library";
import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { BarcodeFormatsType } from "../../typings/BarcodeScannerProps";

const mediaStreamConstraints: MediaStreamConstraints = {
    audio: false,
    video: {
        facingMode: "environment",
        width: { min: 1280, ideal: 2560, max: 2560 },
        height: { min: 720, ideal: 1440, max: 1440 }
    }
};

type UseReaderHook = (args: {
    onSuccess?: (data: string) => void;
    onError?: (e: Error) => void;
    useCrop: boolean;
    barcodeFormats?: BarcodeFormatsType[];
    useAllFormats: boolean;
    canvasMiddleRef: RefObject<HTMLDivElement>;
}) => RefObject<HTMLVideoElement>;

export const useReader: UseReaderHook = args => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const onSuccess = useEventCallback(args.onSuccess);
    const onError = useEventCallback(args.onError);
    const stopped = useRef<boolean>(false);
    const reader = useRef<BrowserMultiFormatReader>();
    const checkNotFound = (error: any): boolean => {
        const ifNotFound = error instanceof NotFoundException;
        return ifNotFound && !stopped.current;
    };

    const loop = (
        resolve: (value: Result) => void,
        reject: (reason?: Error) => void,
        captureCanvas: HTMLCanvasElement,
        videoCropWidth: number,
        videoCropHeight: number
    ): void => {
        try {
            const canvasContext = captureCanvas.getContext("2d", { willReadFrequently: true });
            if (canvasContext !== null && videoRef.current !== null && reader.current !== undefined) {
                canvasContext.drawImage(
                    videoRef.current,
                    (videoRef.current.videoWidth - videoCropWidth) / 2,
                    (videoRef.current.videoHeight - videoCropHeight) / 2,
                    videoCropWidth,
                    videoCropHeight,
                    0,
                    0,
                    videoCropWidth,
                    videoCropHeight
                );
                const luminanceSource = new HTMLCanvasElementLuminanceSource(captureCanvas);
                const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
                const result = reader.current.decodeBitmap(binaryBitmap);
                resolve(result);
            }
        } catch (error) {
            if (checkNotFound(error)) {
                setTimeout(() => loop(resolve, reject, captureCanvas, videoCropWidth, videoCropHeight), 50);
            } else {
                reject(error);
            }
        }
    };

    const scanWithCropOnce = (
        reader: BrowserMultiFormatReader,
        videoRefCurrent: HTMLVideoElement,
        canvasRef: HTMLDivElement
    ): Promise<Result> => {
        const aspectRatioClient = videoRefCurrent.clientWidth / videoRefCurrent.clientHeight;
        const aspectRatioVideo = videoRefCurrent.videoWidth / videoRefCurrent.videoHeight;

        let videoCropWidth = (canvasRef.clientWidth / videoRefCurrent.clientWidth) * videoRefCurrent.videoWidth;
        let videoCropHeight = (canvasRef.clientHeight / videoRefCurrent.clientHeight) * videoRefCurrent.videoHeight;

        if (aspectRatioVideo < aspectRatioClient) {
            videoCropHeight = videoCropWidth;
        } else {
            videoCropWidth = videoCropHeight;
        }

        const captureCanvas = reader.createCaptureCanvas(videoRefCurrent);
        captureCanvas.width = videoCropWidth;
        captureCanvas.height = videoCropHeight;

        return new Promise((resolve, reject) => loop(resolve, reject, captureCanvas, videoCropWidth, videoCropHeight));
    };

    useEffect(() => {
        const hints = new Map();
        let formats: BarcodeFormat[] = [];
        if (args.useAllFormats) {
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
            if (args.barcodeFormats) {
                formats = args.barcodeFormats.map(val => BarcodeFormat[val.barcodeFormat]);
            }
        }
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
        hints.set(DecodeHintType.ENABLE_CODE_39_EXTENDED_MODE, true);
        const newReader = new BrowserMultiFormatReader(hints, 500);
        reader.current = newReader;
        const stop = (): void => {
            stopped.current = true;
            newReader.stopAsyncDecode();
            newReader.reset();
        };
        const start = async (): Promise<void> => {
            let stream;
            if (videoRef.current === null) {
                return;
            }
            try {
                stream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
                let result: Result;
                if (args.useCrop) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.autofocus = true;
                    videoRef.current.playsInline = true; // Fix error in Safari
                    await videoRef.current.play();
                    if (args.canvasMiddleRef.current === null) {
                        return;
                    }
                    result = await scanWithCropOnce(newReader, videoRef.current, args.canvasMiddleRef.current);
                } else {
                    result = await newReader.decodeOnceFromStream(stream, videoRef.current);
                }
                if (!stopped.current) {
                    onSuccess(result.getText());
                }
            } catch (error) {
                // Suppress not found error if widget is closed normally (eg. leaving page);
                if (!checkNotFound(error)) {
                    if (error instanceof Error) {
                        console.error(error.message);
                    }
                    if (onError) {
                        onError(error);
                    }
                }
            } finally {
                stop();
                stream?.getVideoTracks().forEach(track => track.stop());
            }
        };

        start();

        return stop;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return videoRef;
};
