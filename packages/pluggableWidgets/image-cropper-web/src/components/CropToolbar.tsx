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
    rotateLeftLabel: string;
    rotateRightLabel: string;
    grayscaleCaption: string;
    grayscaleAriaLabel: string;
    resetCaption: string;
    resetAriaLabel: string;
    zoomCaption: string;
    zoomAriaLabel: string;
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
                        aria-label={props.rotateLeftLabel}
                        title={props.rotateLeftLabel}
                        onClick={props.onRotateLeft}
                    >
                        <img src={RotateLeftIcon} alt="" className="widget-image-cropper__tool-icon" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-default widget-image-cropper__tool widget-image-cropper__tool--icon"
                        aria-label={props.rotateRightLabel}
                        title={props.rotateRightLabel}
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
                    aria-label={props.grayscaleAriaLabel}
                    title={props.grayscaleCaption}
                    aria-pressed={props.grayscale}
                    onClick={props.onToggleGrayscale}
                >
                    {props.grayscaleCaption}
                </button>
            )}
            {props.showZoom && (
                <ZoomSlider
                    zoom={props.zoom}
                    minZoom={props.minZoom}
                    maxZoom={props.maxZoom}
                    label={props.zoomCaption}
                    ariaLabel={props.zoomAriaLabel}
                    onChange={props.onZoomChange}
                />
            )}
            {props.showReset && (
                <button
                    type="button"
                    className="btn btn-default widget-image-cropper__reset"
                    aria-label={props.resetAriaLabel}
                    title={props.resetCaption}
                    onClick={props.onReset}
                    disabled={!props.canReset}
                >
                    {props.resetCaption}
                </button>
            )}
        </div>
    );
}
