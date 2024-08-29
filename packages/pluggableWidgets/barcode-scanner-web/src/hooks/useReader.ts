import { useEffect, useRef, RefObject } from "react";
import { BrowserMultiFormatReader, NotFoundException, Result } from "@zxing/library";
import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { BarcodeFormatsType } from "../../typings/BarcodeScannerProps";
import { createHints, decodeCanvas, drawCropOnCanvas } from "../components/utils";

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

    const decodeCropFromVideo = (
        // loop decode canvas till it finds a result
        resolve: (value: Result) => void,
        reject: (reason?: Error) => void,
        captureCanvas: HTMLCanvasElement
    ): void => {
        try {
            if (videoRef.current === null || reader.current === undefined || args.canvasMiddleRef.current === null) {
                setTimeout(() => decodeCropFromVideo(resolve, reject, captureCanvas), 50);
                return;
            }
            const croppedOnCanvas = drawCropOnCanvas(captureCanvas, videoRef.current, args.canvasMiddleRef.current);
            const result = decodeCanvas(reader.current, croppedOnCanvas);
            if (result === null) {
                throw new NotFoundException();
            }
            resolve(result);
        } catch (error) {
            if (checkNotFound(error)) {
                setTimeout(() => decodeCropFromVideo(resolve, reject, captureCanvas), 50);
            } else {
                reject(error);
            }
        }
    };

    useEffect(() => {
        const hints = createHints(args.useAllFormats, args.barcodeFormats);
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
                    const captureCanvas = newReader.createCaptureCanvas(videoRef.current);
                    result = await new Promise((resolve, reject) =>
                        decodeCropFromVideo(resolve, reject, captureCanvas)
                    );
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
