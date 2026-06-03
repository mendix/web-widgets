import { Dispatch, SetStateAction, useCallback } from "react";
import { WheelZoomModeEnum } from "../../typings/ImageCropperProps";

interface UseWheelZoomArgs {
    mode: WheelZoomModeEnum;
    minZoom: number;
    maxZoom: number;
    setZoom: Dispatch<SetStateAction<number>>;
}

const STEP = 0.1;

export function useWheelZoom(args: UseWheelZoomArgs): (e: globalThis.WheelEvent) => void {
    const { mode, minZoom, maxZoom, setZoom } = args;

    return useCallback(
        (e: globalThis.WheelEvent) => {
            if (mode === "off") {
                return;
            }
            if (mode === "onWithCtrl" && !(e.ctrlKey || e.metaKey)) {
                return;
            }
            e.preventDefault();
            const direction = e.deltaY < 0 ? 1 : -1;
            setZoom(prev => {
                const next = prev * (1 + STEP * direction);
                return Math.min(maxZoom, Math.max(minZoom, Number(next.toFixed(4))));
            });
        },
        [mode, minZoom, maxZoom, setZoom]
    );
}
