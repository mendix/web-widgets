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
} from "@zxing/library/cjs";
import { useEventCallback } from "@mendix/pluggable-widgets-commons";

const hints = new Map();
// RSS_Expanded is not production ready yet.
const exclusions = new Set([BarcodeFormat.RSS_EXPANDED]);
// `BarcodeFormat` is a TypeScript enum. Calling `Object.values` on it returns an array of string and ints, we only want the latter.
const formats = Object.values(BarcodeFormat)
    .filter((format): format is BarcodeFormat => typeof format !== "string")
    .filter(format => !exclusions.has(format));
hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

const mediaStreamConstraints: MediaStreamConstraints = {
    audio: false,
    video: {
        facingMode: "environment",
        width: { min: 1280, ideal: 1920, max: 2560 },
        height: { min: 720, ideal: 1080, max: 1440 }
    }
};

type UseReaderHook = (args: {
    onSuccess?: (data: string) => void;
    onError?: (e: Error) => void;
    showMask: boolean;
}) => RefObject<HTMLVideoElement>;

export const useReader: UseReaderHook = args => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const onSuccess = useEventCallback(args.onSuccess);
    const onError = useEventCallback(args.onError);
    const scale = 0.5;

    const scanWithCropOnce = (reader: BrowserMultiFormatReader, canvas: HTMLCanvasElement): Promise<Result> => {
        const loop: any = (resolve: (value?: Result) => void, reject: (reason?: any) => void) => {
            try {
                const canvasContext = canvas.getContext("2d");
                if (canvasContext !== null) {
                    canvasContext.drawImage(
                        videoRef.current!,
                        (videoRef.current!.videoWidth - videoRef.current!.videoWidth * scale) / 2,
                        (videoRef.current!.videoHeight - videoRef.current!.videoHeight * scale) / 2,
                        videoRef.current!.videoWidth * scale,
                        videoRef.current!.videoHeight * scale,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );
                    const luminanceSource = new HTMLCanvasElementLuminanceSource(canvas);
                    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
                    reader.hints = hints;
                    const result = reader.decodeBitmap(binaryBitmap);
                    resolve(result);
                }
            } catch (e) {
                const ifNotFound = e instanceof NotFoundException;
                if (ifNotFound) {
                    // trying again
                    return setTimeout(loop, reader.timeBetweenDecodingAttempts, resolve, reject);
                }
                reject(e);
            }
        };
        return new Promise((resolve, reject) => loop(resolve, reject));
    };

    useEffect(() => {
        let stopped = false;
        const reader = new BrowserMultiFormatReader();

        const stop = (): void => {
            stopped = true;
            reader.stopAsyncDecode();
            reader.reset();
        };

        const start = async (): Promise<void> => {
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
                reader.hints = hints;
                reader.timeBetweenDecodingAttempts = 500;
                if (!stopped && videoRef.current) {
                    if (args.showMask) {
                        videoRef.current!.srcObject = stream;
                        videoRef.current!.autofocus = true;
                        videoRef.current.playsInline = true; // Fix error in Safari
                        await videoRef.current.play();
                        const captureCanvas = reader.createCaptureCanvas(videoRef.current!);
                        captureCanvas.width = videoRef.current!.videoWidth;
                        captureCanvas.height = videoRef.current!.videoHeight;
                        const result = await scanWithCropOnce(reader, captureCanvas);
                        onSuccess(result.getText());
                    } else {
                        const result = await reader.decodeOnceFromStream(stream, videoRef.current);
                        if (!stopped) {
                            onSuccess(result.getText());
                        }
                    }
                }
            } catch (error) {
                // Suppress not found error if widget is closed normally (eg. leaving page);
                const isNotFound = stopped && error instanceof NotFoundException;
                if (!isNotFound) {
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
