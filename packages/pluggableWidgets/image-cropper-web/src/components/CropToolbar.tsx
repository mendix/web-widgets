import classNames from "classnames";
import { ReactElement } from "react";

interface CropToolbarProps {
    showRotation: boolean;
    showGrayscale: boolean;
    showReset: boolean;
    grayscale: boolean;
    canReset: boolean;
    onRotateLeft: () => void;
    onRotateRight: () => void;
    onToggleGrayscale: () => void;
    onReset: () => void;
}

export function CropToolbar(props: CropToolbarProps): ReactElement | null {
    if (!props.showRotation && !props.showGrayscale && !props.showReset) {
        return null;
    }
    return (
        <div className="widget-image-cropper__toolbar">
            {props.showRotation && (
                <>
                    <button
                        type="button"
                        className="btn btn-default widget-image-cropper__tool"
                        aria-label="Rotate left"
                        onClick={props.onRotateLeft}
                    >
                        ⟲
                    </button>
                    <button
                        type="button"
                        className="btn btn-default widget-image-cropper__tool"
                        aria-label="Rotate right"
                        onClick={props.onRotateRight}
                    >
                        ⟳
                    </button>
                </>
            )}
            {props.showGrayscale && (
                <button
                    type="button"
                    className={classNames("btn btn-default widget-image-cropper__tool", {
                        active: props.grayscale
                    })}
                    aria-label="Black and white"
                    aria-pressed={props.grayscale}
                    onClick={props.onToggleGrayscale}
                >
                    B&amp;W
                </button>
            )}
            {props.showReset && (
                <button
                    type="button"
                    className="btn btn-default widget-image-cropper__reset"
                    onClick={props.onReset}
                    disabled={!props.canReset}
                >
                    Reset
                </button>
            )}
        </div>
    );
}
