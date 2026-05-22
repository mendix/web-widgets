import { WheelEvent, useCallback } from "react";
import { WheelZoomModeEnum } from "../../typings/ImageCropProps";

interface UseWheelZoomArgs {
    mode: WheelZoomModeEnum;
    zoom: number;
    minZoom: number;
    maxZoom: number;
    setZoom: (z: number) => void;
}

const STEP = 0.1;

export function useWheelZoom(args: UseWheelZoomArgs): (e: WheelEvent) => void {
    const { mode, zoom, minZoom, maxZoom, setZoom } = args;

    return useCallback(
        (e: WheelEvent) => {
            if (mode === "off") {
                return;
            }
            if (mode === "onWithCtrl" && !(e.ctrlKey || e.metaKey)) {
                return;
            }
            e.preventDefault();
            const direction = e.deltaY < 0 ? 1 : -1;
            const next = zoom * (1 + STEP * direction);
            const clamped = Math.min(maxZoom, Math.max(minZoom, Number(next.toFixed(4))));
            setZoom(clamped);
        },
        [mode, zoom, minZoom, maxZoom, setZoom]
    );
}
