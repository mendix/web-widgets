import { ChangeEvent, ReactElement } from "react";

interface ZoomSliderProps {
    zoom: number;
    minZoom: number;
    maxZoom: number;
    label: string;
    ariaLabel: string;
    onChange: (zoom: number) => void;
}

export function ZoomSlider({ zoom, minZoom, maxZoom, label, ariaLabel, onChange }: ZoomSliderProps): ReactElement {
    return (
        <label className="widget-image-cropper__zoom">
            <span className="widget-image-cropper__zoom-label">{label}</span>
            <input
                type="range"
                min={minZoom}
                max={maxZoom}
                step={0.01}
                value={zoom}
                aria-label={ariaLabel}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
            />
        </label>
    );
}
