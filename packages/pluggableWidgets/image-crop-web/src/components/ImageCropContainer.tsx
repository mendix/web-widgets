import classNames from "classnames";
import { ValueStatus } from "mendix";
import { ReactElement, useCallback } from "react";
import { CropArea } from "./CropArea";
import { CropButton } from "./CropButton";
import { PreviewPane } from "./PreviewPane";
import { ZoomSlider } from "./ZoomSlider";
import { ImageCropContainerProps } from "../../typings/ImageCropProps";
import { useImageCropState } from "../hooks/useImageCropState";
import { resolveAspectRatio } from "../utils/aspectRatio";
import { cropImage, CropError } from "../utils/cropImage";

export function ImageCropContainer(props: ImageCropContainerProps): ReactElement | null {
    const state = useImageCropState(Number(props.minZoom));

    const handleCrop = useCallback(async () => {
        const img = state.imageRef.current;
        if (!img || !state.completedCrop || props.image.readOnly || props.image.status !== ValueStatus.Available) {
            return;
        }
        try {
            const file = await cropImage({
                image: img,
                pixelCrop: state.completedCrop,
                zoom: state.zoom,
                outputFormat: props.outputFormat,
                outputQuality: Number(props.outputQuality ?? 0.92),
                outputSize: props.outputSize,
                cropShape: props.cropShape,
                viewportWidth: props.boundaryWidth,
                viewportHeight: props.boundaryHeight
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
                console.error("[image-crop-web]", err.message);
            } else {
                throw err;
            }
        }
    }, [state, props]);

    if (props.image.status === ValueStatus.Loading) {
        return <div className="widget-image-crop widget-image-crop--loading" aria-busy="true" />;
    }
    if (props.image.status !== ValueStatus.Available || !props.image.value) {
        return <div className="widget-image-crop widget-image-crop--empty">No image</div>;
    }

    const aspect = resolveAspectRatio(props.aspectRatio, props.customAspectWidth ?? 0, props.customAspectHeight ?? 0);
    const caption = props.cropButtonCaption?.value ?? "Crop";

    return (
        <div className={classNames("widget-image-crop", props.class)} style={props.style}>
            <CropArea
                src={props.image.value.uri}
                crop={state.crop}
                onCropChange={state.setCrop}
                onCropComplete={state.setCompletedCrop}
                aspect={aspect}
                circular={props.cropShape === "circle"}
                resizable={props.resizableEnabled}
                boundaryWidth={props.boundaryWidth}
                boundaryHeight={props.boundaryHeight}
                zoom={state.zoom}
                minZoom={Number(props.minZoom)}
                maxZoom={Number(props.maxZoom)}
                setZoom={state.setZoom}
                wheelZoomMode={props.wheelZoomMode}
                imageRef={state.imageRef}
            />
            {props.zoomEnabled ? (
                <ZoomSlider
                    zoom={state.zoom}
                    minZoom={Number(props.minZoom)}
                    maxZoom={Number(props.maxZoom)}
                    onChange={state.setZoom}
                />
            ) : null}
            {props.showPreview ? (
                <PreviewPane
                    image={state.imageRef.current}
                    pixelCrop={state.completedCrop}
                    zoom={state.zoom}
                    width={props.previewWidth ?? 100}
                    height={props.previewHeight ?? 100}
                    circle={props.cropShape === "circle"}
                />
            ) : null}
            <CropButton
                caption={caption}
                disabled={props.image.readOnly || !state.completedCrop}
                onClick={handleCrop}
            />
        </div>
    );
}
