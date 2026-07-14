import classNames from "classnames";
import { ReactElement, createRef, useState } from "react";
import { type Crop } from "react-image-crop";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { ImageCropperPreviewProps } from "../typings/ImageCropperProps";
import CropperPlaceholderIcon from "./assets/cropper-placeholder.svg";
import { CropArea } from "./components/CropArea";
import { resolveAspectRatio } from "./utils/aspectRatio";
import { describeConfig } from "./utils/describeConfig";

declare function require(name: string): string;

// Defaults used when boundary props are blank in the editor — keep the preview box compact.
const PREVIEW_BOUNDARY_WIDTH = 260;
const PREVIEW_BOUNDARY_HEIGHT = 170;

// Renders the real CropArea against a static (design-time) image URL with all interaction
// disabled, so design mode shows a faithful, non-clickable crop preview.
function StaticCropPreview(props: { imageUrl: string; values: ImageCropperPreviewProps }): ReactElement {
    const { imageUrl, values } = props;
    const [crop, setCrop] = useState<Crop | undefined>(undefined);
    const imageRef = createRef<HTMLImageElement>();

    const aspect = resolveAspectRatio(
        values.aspectRatio,
        values.customAspectWidth ?? 0,
        values.customAspectHeight ?? 0
    );

    const handleImageLoad = (percentCrop: Crop): void => {
        // Display-only preview: just draw the centered selection CropArea computed for us.
        // No zoom/commit/auto-apply machinery — that's runtime-only.
        setCrop(percentCrop);
    };

    return (
        <div className="widget-image-cropper__preview-canvas">
            <CropArea
                src={imageUrl}
                crop={crop}
                onCropChange={setCrop}
                onCropComplete={() => undefined}
                aspect={aspect}
                circular={values.cropShape === "circle"}
                resizable={false}
                boundaryWidth={values.boundaryWidth ?? PREVIEW_BOUNDARY_WIDTH}
                boundaryHeight={values.boundaryHeight ?? PREVIEW_BOUNDARY_HEIGHT}
                onImageLoad={handleImageLoad}
                zoom={values.minZoom ?? 1}
                minZoom={values.minZoom ?? 1}
                maxZoom={values.maxZoom ?? 1}
                setZoom={() => undefined}
                wheelZoomMode="off"
                grayscale={false}
                imageRef={imageRef}
            />
        </div>
    );
}

export function preview(props: ImageCropperPreviewProps): ReactElement {
    // Narrow on the object (not a derived boolean) so TS keeps .imageUrl / .entity typed.
    const staticImage = props.image?.type === "static" ? props.image : undefined;
    const dynamicEntity = props.image?.type === "dynamic" ? props.image.entity : undefined;

    // Dynamic bindings carry only the entity name — no design-time pixels — so they still show the
    // placeholder, but the caption must reflect that an attribute IS bound (not "nothing selected").
    const caption = staticImage ? describeConfig(props) : dynamicEntity || "[No image selected yet]";

    return (
        <div
            className={classNames(props.class, "widget-image-cropper", "widget-image-cropper--preview")}
            style={parseStyle(props.style)}
        >
            <div className="widget-image-cropper__preview-box">
                {staticImage ? (
                    <StaticCropPreview imageUrl={staticImage.imageUrl} values={props} />
                ) : (
                    <img className="widget-image-cropper__preview-glyph" src={CropperPlaceholderIcon} alt="" />
                )}
            </div>
            <p className="widget-image-cropper__preview-caption">{caption}</p>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/ImageCropper.scss");
}
