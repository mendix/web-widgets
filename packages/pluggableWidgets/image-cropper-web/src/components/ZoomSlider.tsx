import { ChangeEvent, ReactElement } from "react";

interface ZoomSliderProps {
    zoom: number;
    minZoom: number;
    maxZoom: number;
    onChange: (zoom: number) => void;
}

export function ZoomSlider({ zoom, minZoom, maxZoom, onChange }: ZoomSliderProps): ReactElement {
    return (
        <label className="widget-image-cropper__zoom">
            <span className="widget-image-cropper__zoom-label">Zoom</span>
            <input
                type="range"
                min={minZoom}
                max={maxZoom}
                step={0.01}
                value={zoom}
                aria-label="Zoom"
                onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
            />
        </label>
    );
}
