import classNames from "classnames";
import {
    ReactElement,
    RefObject,
    SyntheticEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
    Dispatch,
    SetStateAction
} from "react";
import {
    default as ReactCrop,
    centerCrop,
    convertToPixelCrop,
    makeAspectCrop,
    type Crop,
    type PixelCrop
} from "react-image-crop";
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
    onImageLoad: (percentCrop: Crop, pixelCrop: PixelCrop) => void;
    zoom: number;
    minZoom: number;
    maxZoom: number;
    setZoom: Dispatch<SetStateAction<number>>;
    wheelZoomMode: WheelZoomModeEnum;
    imageRef: RefObject<HTMLImageElement | null>;
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
    const containerRef = useRef<HTMLDivElement | null>(null);
    const onWheel = useWheelZoom({
        mode: props.wheelZoomMode,
        minZoom: props.minZoom,
        maxZoom: props.maxZoom,
        setZoom: props.setZoom
    });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) {
            return;
        }
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [onWheel]);

    const { aspect, onImageLoad, imageRef, boundaryWidth, boundaryHeight, src } = props;

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

    const setImageRef = useCallback(
        (img: HTMLImageElement | null) => {
            imageRef.current = img;
        },
        [imageRef]
    );

    if (loadError) {
        return (
            <div className="widget-image-crop__error">
                Image source does not allow cropping. Upload locally or configure CORS.
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={classNames("widget-image-crop__canvas", {
                "widget-image-crop__canvas--circle": props.circular
            })}
            style={{ maxWidth: props.boundaryWidth, maxHeight: props.boundaryHeight }}
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
                    ref={setImageRef}
                    src={props.src}
                    alt=""
                    crossOrigin="anonymous"
                    style={{
                        width: displaySize?.width,
                        height: displaySize?.height,
                        maxWidth: displaySize ? undefined : props.boundaryWidth,
                        maxHeight: displaySize ? undefined : props.boundaryHeight,
                        transform: `scale(${props.zoom})`,
                        transformOrigin: "center"
                    }}
                    onLoad={handleImageLoad}
                    onError={(_e: SyntheticEvent<HTMLImageElement>) => setLoadError(true)}
                />
            </ReactCrop>
        </div>
    );
}
