import classNames from "classnames";
import { ReactElement, RefObject, SyntheticEvent, useState } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import { WheelZoomModeEnum } from "../../typings/ImageCropProps";
import { useWheelZoom } from "../hooks/useWheelZoom";

interface CropAreaProps {
    src: string;
    crop: Crop | undefined;
    onCropChange: (crop: Crop) => void;
    onCropComplete: (pixelCrop: PixelCrop) => void;
    aspect: number | undefined;
    circular: boolean;
    resizable: boolean;
    boundaryWidth: number;
    boundaryHeight: number;
    zoom: number;
    minZoom: number;
    maxZoom: number;
    setZoom: (z: number) => void;
    wheelZoomMode: WheelZoomModeEnum;
    imageRef: RefObject<HTMLImageElement | null>;
}

export function CropArea(props: CropAreaProps): ReactElement {
    const [loadError, setLoadError] = useState(false);
    const onWheel = useWheelZoom({
        mode: props.wheelZoomMode,
        zoom: props.zoom,
        minZoom: props.minZoom,
        maxZoom: props.maxZoom,
        setZoom: props.setZoom
    });

    if (loadError) {
        return (
            <div className="widget-image-crop__error">
                Image source does not allow cropping. Upload locally or configure CORS.
            </div>
        );
    }

    return (
        <div
            className={classNames("widget-image-crop__canvas", {
                "widget-image-crop__canvas--circle": props.circular
            })}
            style={{ width: props.boundaryWidth, height: props.boundaryHeight }}
            onWheel={onWheel}
        >
            <ReactCrop
                crop={props.crop}
                onChange={(_pixel, percent) => props.onCropChange(percent)}
                onComplete={pixel => props.onCropComplete(pixel)}
                aspect={props.aspect}
                circularCrop={props.circular}
                disabled={!props.resizable}
                locked={!props.resizable}
                keepSelection
            >
                <img
                    ref={img => {
                        props.imageRef.current = img;
                    }}
                    src={props.src}
                    alt=""
                    crossOrigin="anonymous"
                    style={{ transform: `scale(${props.zoom})`, transformOrigin: "center" }}
                    onError={(_e: SyntheticEvent<HTMLImageElement>) => setLoadError(true)}
                />
            </ReactCrop>
        </div>
    );
}
