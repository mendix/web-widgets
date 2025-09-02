import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { useEffect, useMemo, useRef } from "react";
import { MxBarcodeReader } from "src/helpers/barcode-detector";
import { isBarcodeDetectorSupported } from "../helpers/barcode-detector-utils";
import { UseReaderHook } from "../helpers/utils";
import { Reader as NativeReader } from "./nativeReader";
import { Reader as ZxReader } from "./zxReader";

export const useReader: UseReaderHook = args => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const onSuccess = useEventCallback(args.onSuccess);
    const onError = useEventCallback(args.onError);
    const enableBrowserAPI = useMemo(() => isBarcodeDetectorSupported(), []);

    const reader: MxBarcodeReader = useMemo(() => {
        return enableBrowserAPI ? new NativeReader(args, videoRef) : new ZxReader(args, videoRef);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enableBrowserAPI, args.barcodeFormats, args.useAllFormats, args.useCrop, videoRef]);

    useEffect(() => {
        reader.start(onSuccess, onError);

        return reader.stop;
    }, [onSuccess, onError, reader]);

    return { ref: videoRef, useBrowserAPI: enableBrowserAPI };
};
