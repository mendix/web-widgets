import classNames from "classnames";
import { ValueStatus } from "mendix";
import { ReactElement, SetStateAction, useCallback, useEffect, useRef } from "react";
import { type Crop, type PixelCrop } from "react-image-crop";
import { CropArea } from "./CropArea";
import { PreviewPane } from "./PreviewPane";
import { ZoomSlider } from "./ZoomSlider";
import { ImageCropperContainerProps } from "../../typings/ImageCropperProps";
import { useAutoApplyCrop } from "../hooks/useAutoApplyCrop";
import { useImageCropperState } from "../hooks/useImageCropperState";
import { resolveAspectRatio } from "../utils/aspectRatio";
import { cropImage, CropError } from "../utils/cropImage";

export function ImageCropperContainer(props: ImageCropperContainerProps): ReactElement | null {
    const state = useImageCropperState(Number(props.minZoom));

    const { setZoom, setLiveCrop, setCommittedCrop } = state;

    const committedCropRef = useRef<PixelCrop | undefined>(undefined);
    committedCropRef.current = state.committedCrop;
    const zoomRef = useRef(state.zoom);
    zoomRef.current = state.zoom;

    const applyCrop = useCallback(async () => {
        const img = state.imageRef.current;
        const committedCrop = committedCropRef.current;
        if (
            !img ||
            !committedCrop ||
            props.image.readOnly ||
            props.image.status !== ValueStatus.Available ||
            !props.image.value
        ) {
            return;
        }
        try {
            const file = await cropImage({
                image: img,
                pixelCrop: committedCrop,
                zoom: zoomRef.current,
                outputFormat: props.outputFormat,
                outputQuality: Number(props.outputQuality),
                outputSize: props.outputSize,
                cropShape: props.cropShape,
                viewportWidth: props.boundaryWidth,
                viewportHeight: props.boundaryHeight,
                originalName: props.image.value.name
            });
            if (props.outputSize === "viewport") {
                props.image.setThumbnailSize(props.boundaryWidth, props.boundaryHeight);
            }
            props.image.setValue(file);
            if (props.onCropAction?.canExecute) {
                props.onCropAction.execute();
            }
        } catch (err) {
            if (err instanceof CropError) {
                console.error("[image-cropper-web] CropError:", err.message);
            } else {
                console.error("[image-cropper-web] unexpected error:", err);
                throw err;
            }
        }
    }, [
        state.imageRef,
        props.image,
        props.outputFormat,
        props.outputQuality,
        props.outputSize,
        props.cropShape,
        props.boundaryWidth,
        props.boundaryHeight,
        props.onCropAction
    ]);

    const auto = useAutoApplyCrop(applyCrop);
    const { armed } = auto;

    const handleImageLoad = useCallback(
        (percentCrop: Crop, pixelCrop: PixelCrop) => {
            setZoom(Number(props.minZoom));
            setLiveCrop(percentCrop);
            setCommittedCrop(pixelCrop);
            armed();
        },
        [setZoom, setLiveCrop, setCommittedCrop, props.minZoom, armed]
    );

    const uri = props.image.status === ValueStatus.Available ? props.image.value?.uri : undefined;
    useEffect(() => {
        setLiveCrop(undefined);
        setCommittedCrop(undefined);
        armed();
    }, [uri, setLiveCrop, setCommittedCrop, armed]);

    const handleCropComplete = useCallback(
        (pixelCrop: PixelCrop) => {
            committedCropRef.current = pixelCrop;
            setCommittedCrop(pixelCrop);
            auto.applyNow();
        },
        [setCommittedCrop, auto]
    );

    const handleZoomChange = useCallback(
        (next: SetStateAction<number>) => {
            setZoom(next);
            auto.applyDebounced();
        },
        [setZoom, auto]
    );

    if (props.image.status === ValueStatus.Loading) {
        return (
            <div
                className={classNames("widget-image-cropper", "widget-image-cropper--loading", props.class)}
                style={props.style}
                tabIndex={props.tabIndex}
                aria-busy="true"
            />
        );
    }
    if (props.image.status !== ValueStatus.Available || !props.image.value) {
        return (
            <div
                className={classNames("widget-image-cropper", "widget-image-cropper--empty", props.class)}
                style={props.style}
                tabIndex={props.tabIndex}
            >
                No image
            </div>
        );
    }

    const aspect = resolveAspectRatio(props.aspectRatio, props.customAspectWidth, props.customAspectHeight);

    return (
        <div className={classNames("widget-image-cropper", props.class)} style={props.style} tabIndex={props.tabIndex}>
            <CropArea
                src={props.image.value.uri}
                crop={state.liveCrop}
                onCropChange={state.setLiveCrop}
                onCropComplete={handleCropComplete}
                aspect={aspect}
                circular={props.cropShape === "circle"}
                resizable={props.resizableEnabled}
                boundaryWidth={props.boundaryWidth}
                boundaryHeight={props.boundaryHeight}
                onImageLoad={handleImageLoad}
                zoom={state.zoom}
                minZoom={Number(props.minZoom)}
                maxZoom={Number(props.maxZoom)}
                setZoom={handleZoomChange}
                wheelZoomMode={props.zoomEnabled ? props.wheelZoomMode : "off"}
                imageRef={state.imageRef}
            />
            {props.zoomEnabled && props.showZoomSlider ? (
                <ZoomSlider
                    zoom={state.zoom}
                    minZoom={Number(props.minZoom)}
                    maxZoom={Number(props.maxZoom)}
                    onChange={handleZoomChange}
                />
            ) : null}
            {props.showPreview ? (
                <PreviewPane
                    image={state.imageRef.current}
                    pixelCrop={state.committedCrop}
                    zoom={state.zoom}
                    width={props.previewWidth}
                    height={props.previewHeight}
                    circle={props.cropShape === "circle"}
                />
            ) : null}
        </div>
    );
}
