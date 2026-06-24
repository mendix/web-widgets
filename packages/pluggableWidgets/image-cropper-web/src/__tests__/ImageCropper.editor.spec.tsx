import { render } from "@testing-library/react";
import { ImageCropperPreviewProps } from "../../typings/ImageCropperProps";
import { getPreview } from "../ImageCropper.editorConfig";
import { preview } from "../ImageCropper.editorPreview";

function makePreviewProps(overrides: Partial<ImageCropperPreviewProps> = {}): ImageCropperPreviewProps {
    return {
        className: "",
        class: "",
        style: "",
        styleObject: undefined,
        readOnly: false,
        renderMode: "design",
        translate: (t: string) => t,
        image: null,
        cropShape: "rect",
        aspectRatio: "free",
        customAspectWidth: null,
        customAspectHeight: null,
        onCropAction: null,
        boundaryWidth: null,
        boundaryHeight: null,
        showPreview: false,
        previewWidth: null,
        previewHeight: null,
        resizableEnabled: true,
        enableRotation: true,
        enableGrayscale: true,
        showResetButton: true,
        zoomEnabled: true,
        showZoomSlider: true,
        wheelZoomMode: "onWithCtrl",
        minZoom: null,
        maxZoom: null,
        outputFormat: "png",
        outputSize: "original",
        outputQuality: null,
        ...overrides
    };
}

// Walk the StructurePreviewProps tree and collect every Text node's content.
function collectText(node: any): string[] {
    if (!node || typeof node !== "object") {
        return [];
    }
    const here = node.type === "Text" && typeof node.content === "string" ? [node.content] : [];
    const kids = Array.isArray(node.children) ? node.children.flatMap(collectText) : [];
    return [...here, ...kids];
}

describe("ImageCropper structure mode (getPreview)", () => {
    test("shows the widget title", () => {
        const texts = collectText(getPreview(makePreviewProps(), false));
        expect(texts).toContain("Image cropper");
    });

    test("shows placeholder body when no image is bound", () => {
        const texts = collectText(getPreview(makePreviewProps({ image: null }), false));
        expect(texts).toContain("[No attribute selected]");
    });

    test("shows config summary in body when an image is bound", () => {
        const props = makePreviewProps({
            image: { type: "dynamic", entity: "MyModule.Photo" },
            cropShape: "circle",
            aspectRatio: "square",
            outputFormat: "jpeg",
            outputSize: "viewport"
        });
        const texts = collectText(getPreview(props, false));
        expect(texts).toContain("Circle · 1:1 · JPEG · Viewport");
        expect(texts).not.toContain("[No attribute selected]");
    });
});

describe("ImageCropper design mode (preview)", () => {
    test("renders the placeholder glyph and empty caption when nothing is bound", () => {
        const { container, getByText } = render(preview(makePreviewProps({ image: null })));
        expect(container.querySelector(".widget-image-cropper__preview-glyph")).not.toBeNull();
        expect(getByText("[No image selected yet]")).toBeInTheDocument();
    });

    test("shows the bound entity for a dynamic image (placeholder glyph, not previewable)", () => {
        const props = makePreviewProps({ image: { type: "dynamic", entity: "MyModule.Photo" } });
        const { container, getByText, queryByText } = render(preview(props));
        expect(container.querySelector(".widget-image-cropper__preview-glyph")).not.toBeNull();
        expect(getByText("MyModule.Photo")).toBeInTheDocument();
        expect(queryByText("[No image selected yet]")).toBeNull();
    });

    test("renders the real image and config caption for a static image", () => {
        const props = makePreviewProps({
            image: { type: "static", imageUrl: "http://localhost/photo.png" },
            cropShape: "rect",
            aspectRatio: "free",
            outputFormat: "png",
            outputSize: "original"
        });
        const { container, getByText } = render(preview(props));
        const img = container.querySelector("img") as HTMLImageElement;
        expect(img).not.toBeNull();
        expect(img.getAttribute("src")).toBe("http://localhost/photo.png");
        expect(container.querySelector(".widget-image-cropper__preview-glyph")).toBeNull();
        expect(getByText("Rectangle · Free aspect · PNG · Original")).toBeInTheDocument();
    });
});
