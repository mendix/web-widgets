import { useEffect, useRef, RefObject } from "react";
import { BarcodeFormat, BrowserMultiFormatReader, DecodeHintType, NotFoundException } from "@zxing/library/cjs";
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
}) => RefObject<HTMLVideoElement>;

export const useReader: UseReaderHook = args => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const onSuccess = useEventCallback(args.onSuccess);
    const onError = useEventCallback(args.onError);

    useEffect(() => {
        let stopped = false;
        const reader = new BrowserMultiFormatReader(hints, 2000);

        const stop = (): void => {
            stopped = true;
            reader.stopAsyncDecode();
            reader.reset();
        };

        const start = async (): Promise<void> => {
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
                if (!stopped && videoRef.current) {
                    const result = await reader.decodeOnceFromStream(stream, videoRef.current);
                    if (!stopped) {
                        onSuccess(result.getText());
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
