import { RefObject, useEffect, useRef } from "react";
import { BrowserMultiFormatReader, NotFoundException, Result } from "@zxing/library";
import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { BarcodeFormatsType } from "../../typings/BarcodeScannerProps";
import { createHints, decodeCanvas, drawCropOnCanvas } from "../components/utils";
import {
    isBarcodeDetectorSupported,
    createBarcodeDetectorOptions,
    createBarcodeDetector,
    detectBarcodesFromElement,
    captureVideoFrame
} from "../components/barcode-detector-utils";
import type { BarcodeDetector } from "../types/barcode-detector";

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
    const barcodeDetector = useRef<BarcodeDetector | null>(null);
    const detectionCanvas = useRef<HTMLCanvasElement>();
    
    const checkNotFound = (error: any): boolean => {
        const ifNotFound = error instanceof NotFoundException;
        return ifNotFound && !stopped.current;
    };

    // Enhanced detection using BarcodeDetector API with @zxing fallback
    const detectFromVideo = async (video: HTMLVideoElement): Promise<string | null> => {
        // Try BarcodeDetector API first if available
        if (barcodeDetector.current) {
            try {
                const detections = await detectBarcodesFromElement(barcodeDetector.current, video);
                if (detections.length > 0) {
                    console.log("BarcodeDetector detected:", detections[0].format);
                    return detections[0].rawValue;
                }
            } catch (error) {
                console.warn("BarcodeDetector failed, falling back to @zxing/library:", error);
            }
        }

        // Fallback to @zxing/library
        if (reader.current) {
            try {
                if (!detectionCanvas.current) {
                    detectionCanvas.current = document.createElement("canvas");
                }
                const canvas = captureVideoFrame(video, detectionCanvas.current);
                const result = decodeCanvas(reader.current, canvas);
                return result?.getText() || null;
            } catch (error) {
                if (!(error instanceof NotFoundException)) {
                    throw error;
                }
            }
        }
        
        return null;
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
            
            // Enhanced crop detection with BarcodeDetector API support
            const croppedOnCanvas = drawCropOnCanvas(captureCanvas, videoRef.current, args.canvasMiddleRef.current);
            
            // Try BarcodeDetector API first for cropped detection
            if (barcodeDetector.current) {
                barcodeDetector.current.detect(croppedOnCanvas).then(detections => {
                    if (detections.length > 0 && !stopped.current) {
                        console.log("BarcodeDetector (crop) detected:", detections[0].format);
                        // Create a Result-like object for compatibility
                        const result = { getText: () => detections[0].rawValue } as Result;
                        resolve(result);
                        return;
                    }
                    
                    // Fallback to @zxing if BarcodeDetector didn't find anything
                    try {
                        const result = decodeCanvas(reader.current!, croppedOnCanvas);
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
                }).catch(error => {
                    console.warn("BarcodeDetector crop detection failed, using @zxing fallback:", error);
                    // Fallback to @zxing
                    try {
                        const result = decodeCanvas(reader.current!, croppedOnCanvas);
                        if (result === null) {
                            throw new NotFoundException();
                        }
                        resolve(result);
                    } catch (fallbackError) {
                        if (checkNotFound(fallbackError)) {
                            setTimeout(() => decodeCropFromVideo(resolve, reject, captureCanvas), 50);
                        } else {
                            reject(fallbackError);
                        }
                    }
                });
            } else {
                // Use @zxing only
                const result = decodeCanvas(reader.current, croppedOnCanvas);
                if (result === null) {
                    throw new NotFoundException();
                }
                resolve(result);
            }
        } catch (error) {
            if (checkNotFound(error)) {
                setTimeout(() => decodeCropFromVideo(resolve, reject, captureCanvas), 50);
            } else {
                reject(error);
            }
        }
    };

    useEffect(() => {
        // Initialize @zxing/library reader
        const hints = createHints(args.useAllFormats, args.barcodeFormats);
        const newReader = new BrowserMultiFormatReader(hints, 500);
        reader.current = newReader;
        
        // Initialize BarcodeDetector API if supported
        if (isBarcodeDetectorSupported()) {
            const options = createBarcodeDetectorOptions(args.useAllFormats, args.barcodeFormats);
            barcodeDetector.current = createBarcodeDetector(options);
            if (barcodeDetector.current) {
                console.log("BarcodeDetector API initialized successfully");
            }
        } else {
            console.log("BarcodeDetector API not supported, using @zxing/library only");
        }
        
        const stop = (): void => {
            stopped.current = true;
            newReader.stopAsyncDecode();
            newReader.reset();
            barcodeDetector.current = null;
        };
        
        const start = async (): Promise<void> => {
            let stream;
            if (videoRef.current === null) {
                return;
            }
            try {
                stream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);

                let result: Result | string;
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
                    // For non-crop mode, try BarcodeDetector first then fallback to @zxing
                    videoRef.current.srcObject = stream;
                    videoRef.current.autofocus = true;
                    videoRef.current.playsInline = true;
                    await videoRef.current.play();
                    
                    // Polling loop for detection
                    result = await new Promise<string>((resolve, reject) => {
                        const detectLoop = async () => {
                            if (stopped.current) {
                                reject(new Error("Detection stopped"));
                                return;
                            }
                            
                            try {
                                const detected = await detectFromVideo(videoRef.current!);
                                if (detected) {
                                    resolve(detected);
                                } else {
                                    setTimeout(detectLoop, 100);
                                }
                            } catch (error) {
                                if (checkNotFound(error)) {
                                    setTimeout(detectLoop, 100);
                                } else {
                                    reject(error);
                                }
                            }
                        };
                        detectLoop();
                    });
                }
                
                if (!stopped.current) {
                    const text = typeof result === "string" ? result : result.getText();
                    onSuccess(text);
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
