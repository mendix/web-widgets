import { RefObject } from "react";
import { BarcodeDetector, MxBarcodeReader } from "../helpers/barcode-detector";
import {
    createBarcodeDetector,
    createBarcodeDetectorOptions,
    detectBarcodesFromElement
} from "../helpers/barcode-detector-utils";
import { mediaStreamConstraints, ReaderProps } from "../helpers/utils";

export class Reader implements MxBarcodeReader {
    private videoRef: RefObject<HTMLVideoElement>;
    barcodeDetector: BarcodeDetector | null;
    useCrop: boolean;
    stopped: boolean = false;
    canvasMiddleRef: RefObject<HTMLDivElement>;
    stream: MediaStream | null = null;
    decodeInterval: NodeJS.Timeout | number | null = null;

    constructor(args: ReaderProps, videoRef: RefObject<HTMLVideoElement>) {
        this.videoRef = videoRef;
        this.useCrop = args.useCrop;
        this.canvasMiddleRef = args.canvasMiddleRef;
        const options = createBarcodeDetectorOptions(args.useAllFormats, args.barcodeFormats);
        this.barcodeDetector = createBarcodeDetector(options);
    }

    start = async (onSuccess: (data: string) => void, onError: (e: Error) => void): Promise<void> => {
        if (this.videoRef.current === null) {
            return;
        }

        if (this.barcodeDetector === null) {
            if (onError) {
                onError(new Error("Failed to create barcode detector"));
            }

            return;
        }

        this.stream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);

        this.videoRef.current.autofocus = true;
        this.videoRef.current.playsInline = true; // Fix error in Safari
        this.videoRef.current.muted = true;
        this.videoRef.current.autoplay = true;
        this.videoRef.current.srcObject = this.stream;
        this.decodeInterval = setTimeout(this.decodeStream, 50, onSuccess, onError);
    };

    stop = (): void => {
        if (this.decodeInterval) {
            clearTimeout(this.decodeInterval);
        }
        this.stream?.getVideoTracks().forEach(track => track.stop());
        this.barcodeDetector = null;
    };

    decodeStream = async (
        // loop decode canvas till it finds a result
        resolve: (value: string) => void,
        reject: (reason?: Error) => void
    ): Promise<void> => {
        try {
            if (this.decodeInterval) {
                clearTimeout(this.decodeInterval);
            }
            const detectionCode = await detectBarcodesFromElement(this.barcodeDetector, this.videoRef.current);

            if (detectionCode && detectionCode.length > 0) {
                if (resolve) resolve(detectionCode[0].rawValue);
            } else {
                this.decodeInterval = setTimeout(this.decodeStream, 50, resolve, reject);
            }
        } catch (error) {
            console.log("decodeStream error", error);
            reject(error);
        }
    };
}
