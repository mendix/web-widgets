import { useEffect, useRef, RefObject } from "react";
import {
    BarcodeFormat,
    BinaryBitmap,
    BrowserMultiFormatReader,
    DecodeHintType,
    HybridBinarizer,
    NotFoundException,
    RGBLuminanceSource
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

    const scanFrame = async (
        reader: BrowserMultiFormatReader,
        canvas: HTMLCanvasElement,
        cropWidth: number,
        cropHeight: number
    ) => {
        const canvasContext = canvas.getContext("2d");
        if (canvasContext !== null) {
            canvasContext.drawImage(
                videoRef.current!,
                (videoRef.current!.videoWidth - cropWidth) / 2,
                (videoRef.current!.videoHeight - cropHeight) / 2,
                cropWidth, //videoRef.current!.videoWidth * scale,
                cropHeight, //videoRef.current!.videoHeight * scale,
                0,
                0,
                canvas.width,
                canvas.height
            );
            const imgData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
            if (imgData.data) {
                const luminanceSource = new RGBLuminanceSource(
                    new Int32Array(imgData.data.buffer),
                    canvas.width,
                    canvas.height,
                    imgData.width,
                    imgData.height
                );
                const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
                reader.hints = hints;
                try {
                    const result = await reader.decodeBitmap(binaryBitmap);
                    onSuccess(result.getText());
                } catch (NotFoundException) {
                    setTimeout(() => {
                        scanFrame(reader, canvas, cropWidth, cropHeight);
                    }, 500);
                }
            }
        }
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
                reader.hints = hints;
                if (!stopped && videoRef.current) {
                    if (args.showMask) {
                        navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then(stream => {
                            reader.timeBetweenDecodingAttempts = 500;
                            console.log("Start call to scanwithcrop");
                            videoRef.current!.srcObject = stream;
                            videoRef.current!.autofocus = true;
                            videoRef.current!.addEventListener("play", () => {
                                const canvasMiddleMiddle = document.getElementsByClassName("canvas-middle-middle")[0];
                                const captureCanvas = reader.createCaptureCanvas(videoRef.current!);
                                captureCanvas.width = videoRef.current!.videoWidth;
                                captureCanvas.height = videoRef.current!.videoHeight;
                                console.log(captureCanvas);
                                scanFrame(
                                    reader,
                                    captureCanvas,
                                    canvasMiddleMiddle.clientWidth, // videoRef.current!.videoWidth * scale,
                                    canvasMiddleMiddle.clientHeight // videoRef.current!.videoHeight * scale
                                );
                            });
                        });
                    } else {
                        stream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
                        reader.timeBetweenDecodingAttempts = 2000;
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
