import classNames from "classnames";
import { ValueStatus } from "mendix";
import { observer } from "mobx-react-lite";
import { ReactElement, useEffect, useRef } from "react";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/main";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { CropArea } from "./CropArea";
import { CropToolbar } from "./CropToolbar";
import { ImageCropperContainerProps } from "../../typings/ImageCropperProps";
import { ImageCropperStore } from "../stores/ImageCropperStore";

export const ImageCropperContainer = observer(function ImageCropperContainer(
    props: ImageCropperContainerProps
): ReactElement | null {
    const gateProvider = useConst(() => new GateProvider<ImageCropperContainerProps>(props));
    const store = useSetup(() => new ImageCropperStore(gateProvider.gate));

    // Push fresh Mendix props into the gate every render (config + image read live off it).
    useEffect(() => {
        gateProvider.setProps(props);
    });

    const imageRef = useRef<HTMLImageElement>(null);

    // Feed the store the one React-owned dep it still needs: the live on-screen <img> used as
    // the canvas draw source. It closes over a ref, so re-inject every render; assigning a
    // plain (non-observable) field triggers no reactions. Fetch/preview/capture now live in the
    // store, driven by its own reaction on the bound uri.
    useEffect(() => {
        store.setDeps({
            getImage: () => imageRef.current
        });
    });

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
                <svg
                    className="widget-image-cropper__empty-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                >
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <line
                        x1="12"
                        y1="7.5"
                        x2="12"
                        y2="13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <circle cx="12" cy="16.25" r="0.9" fill="currentColor" />
                </svg>
                <span className="widget-image-cropper__empty-text">
                    {props.noImageCaption?.value ?? "No uploaded image to crop"}
                </span>
            </div>
        );
    }

    return (
        <div className={classNames("widget-image-cropper", props.class)} style={props.style} tabIndex={props.tabIndex}>
            <CropArea
                src={store.previewSrc ?? props.image.value.uri}
                crop={store.liveCrop}
                onCropChange={crop => store.setLiveCrop(crop)}
                onCropComplete={pixelCrop => store.commitCrop(pixelCrop)}
                onUserInteractStart={() => store.markUserDragged()}
                aspect={store.aspect}
                circular={props.cropShape === "circle"}
                resizable={props.resizableEnabled}
                boundaryWidth={props.boundaryWidth}
                boundaryHeight={props.boundaryHeight}
                onImageLoad={(percentCrop, pixelCrop) => store.initFromImageLoad(percentCrop, pixelCrop)}
                zoom={store.zoom}
                minZoom={Number(props.minZoom)}
                maxZoom={Number(props.maxZoom)}
                setZoom={next => store.setZoom(next)}
                zoomAnchor={store.zoomAnchor}
                wheelZoomMode={props.zoomEnabled ? props.wheelZoomMode : "off"}
                grayscale={store.grayscale}
                imageRef={imageRef}
            />
            <CropToolbar
                showRotation={props.enableRotation}
                showGrayscale={props.enableGrayscale}
                showZoom={props.zoomEnabled && props.showZoomSlider}
                showReset={props.showResetButton}
                grayscale={store.grayscale}
                canReset={store.canRestore}
                zoom={store.zoom}
                minZoom={Number(props.minZoom)}
                maxZoom={Number(props.maxZoom)}
                rotateLeftLabel={props.rotateLeftLabel?.value ?? "Rotate left"}
                rotateRightLabel={props.rotateRightLabel?.value ?? "Rotate right"}
                grayscaleCaption={props.grayscaleCaption?.value ?? "Grayscale"}
                grayscaleAriaLabel={props.grayscaleAriaLabel?.value ?? "Grayscale"}
                resetCaption={props.resetCaption?.value ?? "Reset"}
                resetAriaLabel={props.resetAriaLabel?.value ?? "Reset crop"}
                zoomCaption={props.zoomCaption?.value ?? "Zoom"}
                zoomAriaLabel={props.zoomAriaLabel?.value ?? "Zoom"}
                onZoomChange={zoom => store.setZoom(zoom)}
                onRotateLeft={() => store.rotate(-90)}
                onRotateRight={() => store.rotate(90)}
                onToggleGrayscale={() => store.toggleGrayscale()}
                onReset={() => store.reset()}
            />
        </div>
    );
});
