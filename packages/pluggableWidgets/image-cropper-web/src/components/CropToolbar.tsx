import classNames from "classnames";
import { ReactElement } from "react";
import { ZoomSlider } from "./ZoomSlider";
import FlipLeftIcon from "../assets/flip-left.svg";
import FlipRightIcon from "../assets/flip-right.svg";

interface CropToolbarProps {
    showFlip: boolean;
    showGrayscale: boolean;
    showZoom: boolean;
    showReset: boolean;
    grayscale: boolean;
    canReset: boolean;
    zoom: number;
    minZoom: number;
    maxZoom: number;
    onFlipLeft: () => void;
    onFlipRight: () => void;
    onToggleGrayscale: () => void;
    onZoomChange: (zoom: number) => void;
    onReset: () => void;
}

export function CropToolbar(props: CropToolbarProps): ReactElement | null {
    if (!props.showFlip && !props.showGrayscale && !props.showZoom && !props.showReset) {
        return null;
    }
    return (
        <div className="widget-image-cropper__toolbar">
            {props.showFlip && (
                <>
                    <button
                        type="button"
                        className="btn btn-default widget-image-cropper__tool widget-image-cropper__tool--icon"
                        aria-label="Flip left"
                        title="Flip left"
                        onClick={props.onFlipLeft}
                    >
                        <img src={FlipLeftIcon} alt="" className="widget-image-cropper__tool-icon" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-default widget-image-cropper__tool widget-image-cropper__tool--icon"
                        aria-label="Flip right"
                        title="Flip right"
                        onClick={props.onFlipRight}
                    >
                        <img src={FlipRightIcon} alt="" className="widget-image-cropper__tool-icon" />
                    </button>
                </>
            )}
            {props.showGrayscale && (
                <button
                    type="button"
                    className={classNames("btn btn-default widget-image-cropper__tool", {
                        active: props.grayscale
                    })}
                    aria-label="Grayscale"
                    title="Grayscale"
                    aria-pressed={props.grayscale}
                    onClick={props.onToggleGrayscale}
                >
                    Grayscale
                </button>
            )}
            {props.showZoom && (
                <ZoomSlider
                    zoom={props.zoom}
                    minZoom={props.minZoom}
                    maxZoom={props.maxZoom}
                    onChange={props.onZoomChange}
                />
            )}
            {props.showReset && (
                <button
                    type="button"
                    className="btn btn-default widget-image-cropper__reset"
                    title="Reset"
                    onClick={props.onReset}
                    disabled={!props.canReset}
                >
                    Reset
                </button>
            )}
        </div>
    );
}
