import { useState } from "react";

// Constants for zooming in and out
const ZOOMIN_MULTIPLIER = 1.2;
const ZOOMOUT_MULTIPLIER = 0.8;

export function useZoomScale() {
    const [zoomLevel, setZoomLevel] = useState(1);

    const zoomIn = () => {
        setZoomLevel(prev => Math.min(prev * ZOOMIN_MULTIPLIER, 10));
    };

    const zoomOut = () => {
        setZoomLevel(prev => Math.max(prev * ZOOMOUT_MULTIPLIER, 0.3));
    };

    return { zoomLevel, zoomIn, zoomOut };
}
