import { useState } from "react";

// Constants for zooming in and out
const ZOOMIN_MULTIPLIER = 1.2;
const ZOOMOUT_MULTIPLIER = 0.8;

type zoomFn = () => void;

type zoomObjects = {
    zoomLevel: number;
    zoomIn: zoomFn;
    zoomOut: zoomFn;
    reset: zoomFn;
};

export function useZoomScale(): zoomObjects {
    const [zoomLevel, setZoomLevel] = useState(1);

    const zoomIn: zoomFn = () => {
        setZoomLevel(prev => Math.min(prev * ZOOMIN_MULTIPLIER, 10));
    };

    const zoomOut: zoomFn = () => {
        setZoomLevel(prev => Math.max(prev * ZOOMOUT_MULTIPLIER, 0.3));
    };

    const reset: zoomFn = () => {
        setZoomLevel(1);
    };

    return { zoomLevel, zoomIn, zoomOut, reset };
}
