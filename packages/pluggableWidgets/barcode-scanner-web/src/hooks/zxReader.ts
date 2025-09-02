import { BrowserMultiFormatReader, NotFoundException, Result } from "@zxing/library";
import { RefObject } from "react";
import { MxBarcodeReader } from "../helpers/barcode-detector";
import { createHints, decodeCanvas, drawCropOnCanvas, mediaStreamConstraints, ReaderProps } from "../helpers/utils";

export class Reader implements MxBarcodeReader {
    private videoRef: RefObject<HTMLVideoElement>;
    barcodeDetector: BrowserMultiFormatReader | null;
    useCrop: boolean;
    stopped: boolean = false;
    canvasMiddleRef: RefObject<HTMLDivElement>;

    constructor(args: ReaderProps, videoRef: RefObject<HTMLVideoElement>) {
        this.videoRef = videoRef;
        this.useCrop = args.useCrop;
        this.canvasMiddleRef = args.canvasMiddleRef;

        const hints = createHints(args.useAllFormats, args.barcodeFormats);
        this.barcodeDetector = new BrowserMultiFormatReader(hints, 500);
    }

    start = async (onSuccess: (data: string) => void, onError: (e: Error) => void): Promise<void> => {
        let stream;
        if (this.videoRef.current === null) {
            return;
        }

        if (this.barcodeDetector === null) {
            if (onError) {
                onError(new Error("Failed to create barcode detector"));
            }

            return;
        }
        try {
            stream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);

            let result: Result;
            if (this.useCrop) {
                this.videoRef.current.srcObject = stream;
                this.videoRef.current.autofocus = true;
                this.videoRef.current.playsInline = true; // Fix error in Safari
                await this.videoRef.current.play();
                const captureCanvas = this.barcodeDetector.createCaptureCanvas(this.videoRef.current);
                result = await new Promise((resolve, reject) =>
                    this.decodeCropFromVideo(resolve, reject, captureCanvas)
                );
            } else {
                result = await this.barcodeDetector.decodeOnceFromStream(stream, this.videoRef.current);
            }
            if (!this.stopped) {
                if (onSuccess) onSuccess(result.getText());
            }
        } catch (error) {
            // Suppress not found error if widget is closed normally (eg. leaving page);
            if (!this.checkNotFound(error)) {
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

    stop = (): void => {
        this.stopped = true;
        this.barcodeDetector?.stopAsyncDecode();
        this.barcodeDetector?.reset();
    };

    checkNotFound = (error: any): boolean => {
        const ifNotFound = error instanceof NotFoundException;
        return ifNotFound && !this.stopped;
    };

    decodeCropFromVideo = (
        // loop decode canvas till it finds a result
        resolve: (value: Result) => void,
        reject: (reason?: Error) => void,
        captureCanvas: HTMLCanvasElement
    ): void => {
        try {
            if (this.videoRef === null || this.barcodeDetector === undefined || this.canvasMiddleRef === null) {
                setTimeout(() => this.decodeCropFromVideo(resolve, reject, captureCanvas), 50);
                return;
            }
            const croppedOnCanvas = drawCropOnCanvas(
                captureCanvas,
                this.videoRef.current!,
                this.canvasMiddleRef.current!
            );
            const result = decodeCanvas(this.barcodeDetector!, croppedOnCanvas);
            if (result === null) {
                throw new NotFoundException();
            }
            resolve(result);
        } catch (error) {
            if (this.checkNotFound(error)) {
                setTimeout(() => this.decodeCropFromVideo(resolve, reject, captureCanvas), 50);
            } else {
                reject(error);
            }
        }
    };
}
