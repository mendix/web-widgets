import classNames from "classnames";
import { ValueStatus } from "mendix";
import { ReactElement, SetStateAction, useCallback, useEffect, useRef } from "react";
import { type Crop, type PixelCrop } from "react-image-crop";
import { CropArea } from "./CropArea";
import { CropToolbar } from "./CropToolbar";
import { PreviewPane } from "./PreviewPane";
import { ImageCropperContainerProps } from "../../typings/ImageCropperProps";
import { useAutoApplyCrop } from "../hooks/useAutoApplyCrop";
import { useImageCropperState } from "../hooks/useImageCropperState";
import { useOriginalImage } from "../hooks/useOriginalImage";
import { usePreviewSrc } from "../hooks/usePreviewSrc";
import { resolveAspectRatio } from "../utils/aspectRatio";
import { cropImage, CropError } from "../utils/cropImage";
import { rotateImage } from "../utils/rotateImage";

export function ImageCropperContainer(props: ImageCropperContainerProps): ReactElement | null {
    const state = useImageCropperState(Number(props.minZoom));

    const { setZoom, setLiveCrop, setCommittedCrop, setGrayscale } = state;

    const committedCropRef = useRef<PixelCrop | undefined>(undefined);
    committedCropRef.current = state.committedCrop;
    const zoomRef = useRef(state.zoom);
    zoomRef.current = state.zoom;
    const grayscaleRef = useRef(state.grayscale);
    grayscaleRef.current = state.grayscale;
    const userDraggedRef = useRef(false);

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
                grayscale: grayscaleRef.current,
                originalName: props.image.value.name
            });
            if (props.outputSize === "viewport") {
                props.image.setThumbnailSize(props.boundaryWidth, props.boundaryHeight);
            }
            markInternalRef.current();
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
    const original = useOriginalImage(
        uri,
        props.image.status === ValueStatus.Available ? props.image.value?.name : undefined
    );

    // Ref mirror so applyCrop's stable identity is untouched (same reason zoomRef exists).
    const markInternalRef = useRef(original.markInternalChange);
    markInternalRef.current = original.markInternalChange;

    // Live preview for baked rotations: setValue defers the commit, so show a local
    // blob URL until the bound uri catches up on Save.
    const { previewSrc, showPreview } = usePreviewSrc(uri);
    const showPreviewRef = useRef(showPreview);
    showPreviewRef.current = showPreview;

    useEffect(() => {
        setLiveCrop(undefined);
        setCommittedCrop(undefined);
        armed();
    }, [uri, setLiveCrop, setCommittedCrop, armed]);

    const handleCropComplete = useCallback(
        (pixelCrop: PixelCrop) => {
            committedCropRef.current = pixelCrop;
            setCommittedCrop(pixelCrop);
            if (userDraggedRef.current) {
                userDraggedRef.current = false;
                auto.applyNow();
            }
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

    const handleFlip = useCallback(
        async (deltaDeg: number) => {
            const img = state.imageRef.current;
            if (!img || props.image.readOnly || props.image.status !== ValueStatus.Available || !props.image.value) {
                return;
            }
            try {
                // Working image is ALWAYS color so toggling grayscale OFF stays reversible.
                const working = await rotateImage({
                    image: img,
                    rotation: deltaDeg,
                    outputFormat: props.outputFormat,
                    outputQuality: Number(props.outputQuality),
                    grayscale: false,
                    originalName: props.image.value.name
                });
                // Commit a baked B&W file only while the toggle is ON, so a flip-then-Save
                // with no further crop still persists grayscale.
                const committed = grayscaleRef.current
                    ? await rotateImage({
                          image: img,
                          rotation: deltaDeg,
                          outputFormat: props.outputFormat,
                          outputQuality: Number(props.outputQuality),
                          grayscale: true,
                          originalName: props.image.value.name
                      })
                    : working;
                setLiveCrop(undefined);
                setCommittedCrop(undefined);
                committedCropRef.current = undefined;
                armed();
                // Show COLOR working pixels; CropArea reloads from this blob and rebuilds
                // a fresh crop against the swapped dimensions on its onLoad.
                // The CSS grayscale filter from state.grayscale still renders gray on screen.
                showPreviewRef.current(working);
                markInternalRef.current();
                props.image.setValue(committed);
            } catch (err) {
                if (err instanceof CropError) {
                    console.error("[image-cropper-web] CropError:", err.message);
                } else {
                    throw err;
                }
            }
        },
        [state.imageRef, props.image, props.outputFormat, props.outputQuality, setLiveCrop, setCommittedCrop, armed]
    );

    const handleToggleGrayscale = useCallback(() => {
        setGrayscale(prev => !prev);
        auto.applyDebounced();
    }, [setGrayscale, auto]);

    const handleReset = useCallback(() => {
        setZoom(Number(props.minZoom));
        setGrayscale(false);
        setLiveCrop(undefined);
        setCommittedCrop(undefined);
        armed(); // do not auto-apply the reset itself
        const file = original.getOriginal();
        if (file && !props.image.readOnly && props.image.status === ValueStatus.Available) {
            markInternalRef.current();
            props.image.setValue(file);
        }
    }, [setZoom, props.minZoom, props.image, setGrayscale, setLiveCrop, setCommittedCrop, armed, original]);

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
                src={previewSrc ?? props.image.value.uri}
                crop={state.liveCrop}
                onCropChange={state.setLiveCrop}
                onCropComplete={handleCropComplete}
                onUserInteractStart={() => {
                    userDraggedRef.current = true;
                }}
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
                grayscale={state.grayscale}
                imageRef={state.imageRef}
            />
            <CropToolbar
                showFlip={props.enableFlip}
                showGrayscale={props.enableGrayscale}
                showZoom={props.zoomEnabled && props.showZoomSlider}
                showReset={props.showResetButton}
                grayscale={state.grayscale}
                canReset={original.canRestore}
                zoom={state.zoom}
                minZoom={Number(props.minZoom)}
                maxZoom={Number(props.maxZoom)}
                onZoomChange={handleZoomChange}
                onFlipLeft={() => handleFlip(-90)}
                onFlipRight={() => handleFlip(90)}
                onToggleGrayscale={handleToggleGrayscale}
                onReset={handleReset}
            />
            {props.showPreview ? (
                <PreviewPane
                    image={state.imageRef.current}
                    pixelCrop={state.committedCrop}
                    zoom={state.zoom}
                    width={props.previewWidth}
                    height={props.previewHeight}
                    circle={props.cropShape === "circle"}
                    grayscale={state.grayscale}
                />
            ) : null}
        </div>
    );
}
