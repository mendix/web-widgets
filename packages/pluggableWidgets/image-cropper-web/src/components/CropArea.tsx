import { Dispatch, ReactElement, Ref, SetStateAction, SyntheticEvent, useCallback, useState } from "react";
import {
    default as ReactCrop,
    centerCrop,
    convertToPixelCrop,
    makeAspectCrop,
    type Crop,
    type PixelCrop
} from "react-image-crop";
import { ZoomContainer } from "./ZoomContainer";
import { WheelZoomModeEnum } from "../../typings/ImageCropperProps";
import { safeImageUri } from "../utils/safeImageUri";

export interface CropAreaProps {
    src: string;
    crop: Crop | undefined;
    onCropChange: (crop: Crop) => void;
    onCropComplete: (pixelCrop: PixelCrop) => void;
    aspect: number | undefined;
    circular: boolean;
    resizable: boolean;
    boundaryWidth: number;
    boundaryHeight: number;
    onImageLoad: (percentCrop: Crop, pixelCrop: PixelCrop) => void;
    zoom: number;
    minZoom: number;
    maxZoom: number;
    setZoom: Dispatch<SetStateAction<number>>;
    wheelZoomMode: WheelZoomModeEnum;
    rotation: number;
    grayscale: boolean;
    imageRef: Ref<HTMLImageElement>;
}

function buildInitialCrop(
    img: HTMLImageElement,
    aspect: number | undefined
): { percentCrop: Crop; pixelCrop: PixelCrop } {
    const { naturalWidth, naturalHeight, width, height } = img;
    const safeAspect = aspect ?? naturalWidth / naturalHeight;
    const percentCrop = centerCrop(
        makeAspectCrop({ unit: "%", width: 80 }, safeAspect, naturalWidth, naturalHeight),
        naturalWidth,
        naturalHeight
    );
    return { percentCrop, pixelCrop: convertToPixelCrop(percentCrop, width, height) };
}

function fitToBoundary(
    naturalWidth: number,
    naturalHeight: number,
    boundaryWidth: number,
    boundaryHeight: number
): { width: number; height: number } {
    if (naturalWidth <= 0 || naturalHeight <= 0) {
        return { width: boundaryWidth, height: boundaryHeight };
    }
    const scale = Math.min(boundaryWidth / naturalWidth, boundaryHeight / naturalHeight);
    return { width: Math.round(naturalWidth * scale), height: Math.round(naturalHeight * scale) };
}

export function CropArea(props: CropAreaProps): ReactElement {
    const [loadError, setLoadError] = useState(false);
    const [displaySize, setDisplaySize] = useState<{ width: number; height: number } | null>(null);

    const { aspect, onImageLoad, boundaryWidth, boundaryHeight, src } = props;

    const [prevSrc, setPrevSrc] = useState(src);
    if (prevSrc !== src) {
        setPrevSrc(src);
        setDisplaySize(null);
    }

    const handleImageLoad = useCallback(
        (e: SyntheticEvent<HTMLImageElement>) => {
            const img = e.currentTarget;
            setDisplaySize(fitToBoundary(img.naturalWidth, img.naturalHeight, boundaryWidth, boundaryHeight));
            const { percentCrop, pixelCrop } = buildInitialCrop(img, aspect);
            onImageLoad(percentCrop, pixelCrop);
        },
        [aspect, onImageLoad, boundaryWidth, boundaryHeight]
    );

    const safeSrc = safeImageUri(props.src);

    if (loadError || !safeSrc) {
        return (
            <div className="widget-image-cropper__error">
                Could not load this image. If it is a remote image, the server must allow cross-origin access.
            </div>
        );
    }

    return (
        <ZoomContainer
            mode={props.wheelZoomMode}
            minZoom={props.minZoom}
            maxZoom={props.maxZoom}
            setZoom={props.setZoom}
            boundaryWidth={props.boundaryWidth}
            boundaryHeight={props.boundaryHeight}
            circular={props.circular}
        >
            <ReactCrop
                crop={props.crop}
                onChange={(_pixel, percent) => props.onCropChange(percent)}
                onComplete={pixel => props.onCropComplete(pixel)}
                aspect={props.aspect}
                circularCrop={props.circular}
                disabled={!props.resizable}
                keepSelection
            >
                <img
                    ref={props.imageRef}
                    src={safeSrc}
                    alt=""
                    crossOrigin="anonymous"
                    style={{
                        width: displaySize?.width,
                        height: displaySize?.height,
                        maxWidth: displaySize ? undefined : props.boundaryWidth,
                        maxHeight: displaySize ? undefined : props.boundaryHeight,
                        transform: `scale(${props.zoom}) rotate(${props.rotation}deg)`,
                        transformOrigin: "center",
                        filter: props.grayscale ? "grayscale(1)" : undefined
                    }}
                    onLoad={handleImageLoad}
                    onError={() => setLoadError(true)}
                />
            </ReactCrop>
        </ZoomContainer>
    );
}
