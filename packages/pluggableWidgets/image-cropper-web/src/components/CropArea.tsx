import { Dispatch, ReactElement, Ref, SetStateAction, SyntheticEvent, useCallback, useState } from "react";
import { default as ReactCrop, type Crop, type PixelCrop } from "react-image-crop";
import { ZoomContainer } from "./ZoomContainer";
import { WheelZoomModeEnum } from "../../typings/ImageCropperProps";
import { CENTER_ANCHOR, type ZoomAnchor } from "../utils/cropImage";
import { isStrayCrop, MIN_CROP_PX } from "../utils/cropGuard";
import { buildInitialCrop } from "../utils/initialCrop";
import { safeImageUri } from "../utils/safeImageUri";

export interface CropAreaProps {
    src: string;
    crop: Crop | undefined;
    onCropChange: (crop: Crop) => void;
    onCropComplete: (pixelCrop: PixelCrop) => void;
    onUserInteractStart?: () => void;
    aspect: number | undefined;
    circular: boolean;
    resizable: boolean;
    boundaryWidth: number;
    boundaryHeight: number;
    onImageLoad: (percentCrop: Crop, pixelCrop: PixelCrop) => void;
    zoom: number;
    // Fixed point of the zoom, as fractions (0..1) of the displayed image. Owned by the container
    // and only re-derived when zoom changes, so moving/drawing the box never pans the image.
    // Optional: static callers (editor preview) omit it and default to the image center.
    zoomAnchor?: ZoomAnchor;
    minZoom: number;
    maxZoom: number;
    setZoom: Dispatch<SetStateAction<number>>;
    wheelZoomMode: WheelZoomModeEnum;
    grayscale: boolean;
    imageRef: Ref<HTMLImageElement>;
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

    const { onCropChange, onCropComplete } = props;

    // Ignore a stray click (a ~0-size crop from mousedown+mouseup with no drag) so the existing
    // box survives — see isStrayCrop. Real drags clear the floor (also enforced by minWidth/minHeight).
    const handleChange = useCallback(
        (pixel: PixelCrop, percent: Crop) => {
            if (isStrayCrop(pixel, displaySize)) {
                return;
            }
            onCropChange(percent);
        },
        [displaySize, onCropChange]
    );

    const handleComplete = useCallback(
        (pixel: PixelCrop) => {
            if (isStrayCrop(pixel, displaySize)) {
                return;
            }
            onCropComplete(pixel);
        },
        [displaySize, onCropComplete]
    );

    // Zoom is anchored on props.zoomAnchor (fractions of the displayed image), owned by the
    // container and updated ONLY when the zoom value changes. transformOrigin is the one point
    // scale() keeps fixed on screen, so a frozen anchor keeps the image stable while the box
    // moves/draws; the same anchor drives the export math so saved pixels match the screen.
    const anchor = props.zoomAnchor ?? CENTER_ANCHOR;
    const transformOrigin = `${anchor.x * 100}% ${anchor.y * 100}%`;

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
                onChange={(pixel, percent) => handleChange(pixel, percent)}
                onComplete={pixel => handleComplete(pixel)}
                onDragStart={() => props.onUserInteractStart?.()}
                aspect={props.aspect}
                circularCrop={props.circular}
                disabled={!props.resizable}
                minWidth={MIN_CROP_PX}
                minHeight={MIN_CROP_PX}
            >
                <img
                    ref={props.imageRef}
                    src={safeSrc}
                    alt=""
                    style={{
                        width: displaySize?.width,
                        height: displaySize?.height,
                        maxWidth: displaySize ? undefined : props.boundaryWidth,
                        maxHeight: displaySize ? undefined : props.boundaryHeight,
                        transform: `scale(${props.zoom})`,
                        transformOrigin,
                        filter: props.grayscale ? "grayscale(1)" : undefined
                    }}
                    onLoad={handleImageLoad}
                    onError={() => setLoadError(true)}
                />
            </ReactCrop>
        </ZoomContainer>
    );
}
