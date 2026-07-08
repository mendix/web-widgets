import classNames from "classnames";
import { ValueStatus } from "mendix";
import { ReactElement, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { type Crop, type PixelCrop } from "react-image-crop";
import { CropArea } from "./CropArea";
import { CropToolbar } from "./CropToolbar";
import { ImageCropperContainerProps } from "../../typings/ImageCropperProps";
import { useAutoApplyCrop } from "../hooks/useAutoApplyCrop";
import { useImageCropperState } from "../hooks/useImageCropperState";
import { useOriginalImage } from "../hooks/useOriginalImage";
import { usePreviewSrc } from "../hooks/usePreviewSrc";
import { resolveAspectRatio } from "../utils/aspectRatio";
import { cropImage, CropError, CENTER_ANCHOR, type ZoomAnchor } from "../utils/cropImage";
import { buildInitialCrop } from "../utils/initialCrop";
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
    // Live crop mirror so handleZoomChange (stable identity) can read the box's current center.
    const liveCropRef = useRef<Crop | undefined>(undefined);
    liveCropRef.current = state.liveCrop;

    // Fixed point of the zoom, captured from the box center when zoom changes and frozen while the
    // box moves/draws (so the image stays stable). State drives CropArea's transformOrigin; the ref
    // mirror lets applyCrop's stable closure read it for the matching export math.
    const [zoomAnchor, setZoomAnchor] = useState<ZoomAnchor>(CENTER_ANCHOR);
    const zoomAnchorRef = useRef(zoomAnchor);
    zoomAnchorRef.current = zoomAnchor;

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
                zoomAnchor: zoomAnchorRef.current,
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
            setZoomAnchor(CENTER_ANCHOR);
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
            // Freeze the zoom anchor at the current box center. Recomputing it only here (not while
            // the box moves) keeps the image stable during drags/draws but still zooms into the box.
            const live = liveCropRef.current;
            if (live && live.unit === "%") {
                setZoomAnchor({ x: (live.x + live.width / 2) / 100, y: (live.y + live.height / 2) / 100 });
            }
            setZoom(next);
            auto.applyDebounced();
        },
        [setZoom, auto]
    );

    const handleRotate = useCallback(
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
                // Commit a baked B&W file only while the toggle is ON, so a rotate-then-Save
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
        setZoomAnchor(CENTER_ANCHOR);
        setGrayscale(false);
        armed(); // do not auto-apply the reset itself
        const file = original.getOriginal();
        if (file && !props.image.readOnly && props.image.status === ValueStatus.Available) {
            // Mirror handleRotate: setValue defers the commit, so drive the live preview with the
            // original bytes too — otherwise a stale rotated blob keeps rendering after Reset.
            showPreviewRef.current(file);
            markInternalRef.current();
            props.image.setValue(file);
        }
        // Re-seed the default cropbox to its initial state. If restoring original bytes changed
        // the uri (e.g. after a rotation), CropArea's onLoad re-seeds again against the correct
        // dimensions; when no edit occurred the uri is unchanged and onLoad won't refire, so this
        // direct re-seed is what puts the box back.
        const img = state.imageRef.current;
        if (img && img.naturalWidth) {
            const aspect = resolveAspectRatio(props.aspectRatio, props.customAspectWidth, props.customAspectHeight);
            const { percentCrop, pixelCrop } = buildInitialCrop(img, aspect);
            setLiveCrop(percentCrop);
            setCommittedCrop(pixelCrop);
        } else {
            setLiveCrop(undefined);
            setCommittedCrop(undefined);
        }
    }, [
        setZoom,
        props.minZoom,
        props.image,
        props.aspectRatio,
        props.customAspectWidth,
        props.customAspectHeight,
        setGrayscale,
        setLiveCrop,
        setCommittedCrop,
        armed,
        original,
        state.imageRef
    ]);

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
                zoomAnchor={zoomAnchor}
                wheelZoomMode={props.zoomEnabled ? props.wheelZoomMode : "off"}
                grayscale={state.grayscale}
                imageRef={state.imageRef}
            />
            <CropToolbar
                showRotation={props.enableRotation}
                showGrayscale={props.enableGrayscale}
                showZoom={props.zoomEnabled && props.showZoomSlider}
                showReset={props.showResetButton}
                grayscale={state.grayscale}
                canReset={original.canRestore}
                zoom={state.zoom}
                minZoom={Number(props.minZoom)}
                maxZoom={Number(props.maxZoom)}
                onZoomChange={handleZoomChange}
                onRotateLeft={() => handleRotate(-90)}
                onRotateRight={() => handleRotate(90)}
                onToggleGrayscale={handleToggleGrayscale}
                onReset={handleReset}
            />
        </div>
    );
}
