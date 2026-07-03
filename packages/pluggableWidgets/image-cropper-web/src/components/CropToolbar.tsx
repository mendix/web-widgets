import classNames from "classnames";
import { ReactElement } from "react";
import { ZoomSlider } from "./ZoomSlider";
import RotateLeftIcon from "../assets/rotate-left.svg";
import RotateRightIcon from "../assets/rotate-right.svg";

interface CropToolbarProps {
    showRotation: boolean;
    showGrayscale: boolean;
    showZoom: boolean;
    showReset: boolean;
    grayscale: boolean;
    canReset: boolean;
    zoom: number;
    minZoom: number;
    maxZoom: number;
    onRotateLeft: () => void;
    onRotateRight: () => void;
    onToggleGrayscale: () => void;
    onZoomChange: (zoom: number) => void;
    onReset: () => void;
}

export function CropToolbar(props: CropToolbarProps): ReactElement | null {
    if (!props.showRotation && !props.showGrayscale && !props.showZoom && !props.showReset) {
        return null;
    }
    return (
        <div className="widget-image-cropper__toolbar">
            {props.showRotation && (
                <>
                    <button
                        type="button"
                        className="btn btn-default widget-image-cropper__tool widget-image-cropper__tool--icon"
                        aria-label="Rotate left"
                        title="Rotate left"
                        onClick={props.onRotateLeft}
                    >
                        <img src={RotateLeftIcon} alt="" className="widget-image-cropper__tool-icon" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-default widget-image-cropper__tool widget-image-cropper__tool--icon"
                        aria-label="Rotate right"
                        title="Rotate right"
                        onClick={props.onRotateRight}
                    >
                        <img src={RotateRightIcon} alt="" className="widget-image-cropper__tool-icon" />
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
