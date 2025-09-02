import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { RefObject, useEffect, useMemo, useRef } from "react";
import { MxBarcodeReader } from "src/helpers/barcode-detector";
import { BarcodeFormatsType } from "../../typings/BarcodeScannerProps";
import { isBarcodeDetectorSupported } from "../helpers/barcode-detector-utils";
import { Reader as NativeReader } from "./nativeReader";
import { Reader as ZxReader } from "./zxReader";

type UseReaderHook = (args: {
    onSuccess?: (data: string) => void;
    onError?: (e: Error) => void;
    useCrop: boolean;
    barcodeFormats?: BarcodeFormatsType[];
    useAllFormats: boolean;
    canvasMiddleRef: RefObject<HTMLDivElement>;
}) => { ref: RefObject<HTMLVideoElement>; useBrowserAPI: boolean };

export const useReader: UseReaderHook = args => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const onSuccess = useEventCallback(args.onSuccess);
    const onError = useEventCallback(args.onError);
    const enableBrowserAPI = useMemo(() => isBarcodeDetectorSupported(), []);

    const reader: MxBarcodeReader = useMemo(() => {
        return enableBrowserAPI ? new NativeReader(args, videoRef) : new ZxReader(args, videoRef);
    }, [enableBrowserAPI, args, videoRef]);

    useEffect(() => {
        reader.start(onSuccess, onError);

        return reader.stop;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { ref: videoRef, useBrowserAPI: enableBrowserAPI };
};
