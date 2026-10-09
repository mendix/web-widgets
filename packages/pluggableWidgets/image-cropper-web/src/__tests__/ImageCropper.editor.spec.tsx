import { fireEvent, render } from "@testing-library/react";
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
        customAspectWidth: "1",
        customAspectHeight: "1",
        initialCropSize: null,
        onCropAction: null,
        boundaryWidth: null,
        boundaryHeight: null,
        resizableEnabled: true,
        enableRotation: true,
        enableGrayscale: true,
        showResetButton: true,
        zoomEnabled: true,
        showZoomSlider: true,
        wheelZoomMode: "onWithCtrl",
        minZoom: null,
        maxZoom: null,
        grayscaleCaption: "Grayscale",
        resetCaption: "Reset",
        zoomCaption: "Zoom",
        noImageCaption: "No uploaded image to crop",
        rotateLeftLabel: "Rotate left",
        rotateRightLabel: "Rotate right",
        grayscaleAriaLabel: "Grayscale",
        resetAriaLabel: "Reset crop",
        zoomAriaLabel: "Zoom",
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
    test("shows the configure placeholder when nothing is bound", () => {
        const texts = collectText(getPreview(makePreviewProps(), false));
        expect(texts).toContain("[Configure Image Cropper]");
    });

    test("shows config summary caption when an image is bound", () => {
        const props = makePreviewProps({
            image: { type: "dynamic", entity: "MyModule.Photo" },
            cropShape: "circle",
            aspectRatio: "square",
            outputFormat: "jpeg",
            outputSize: "viewport"
        });
        const texts = collectText(getPreview(props, false));
        expect(texts).toContain("[Circle · 1:1 · JPEG · Viewport] Image Cropper");
        expect(texts).not.toContain("[Configure Image Cropper]");
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

    // The editor only has the expression *text*, never runtime data. A numeric literal can be
    // parsed into a real ratio; an attribute path cannot, so it degrades to free aspect.
    describe("custom aspect ratio from expression text", () => {
        function renderStaticPreview(overrides: Partial<ImageCropperPreviewProps>): ReturnType<typeof render> {
            const props = makePreviewProps({
                image: { type: "static", imageUrl: "http://localhost/photo.png" },
                aspectRatio: "custom",
                boundaryWidth: 400,
                boundaryHeight: 300,
                ...overrides
            });
            const utils = render(preview(props));
            const img = utils.container.querySelector("img") as HTMLImageElement;
            Object.defineProperty(img, "naturalWidth", { value: 400, configurable: true });
            Object.defineProperty(img, "naturalHeight", { value: 300, configurable: true });
            Object.defineProperty(img, "width", { value: 400, configurable: true });
            Object.defineProperty(img, "height", { value: 300, configurable: true });
            fireEvent.load(img);
            return utils;
        }

        // react-image-crop renders the selection box with percentage width/height, so the drawn
        // box's aspect (scaled by the image's own aspect) reveals which ratio was applied.
        function selectionAspect(container: HTMLElement): number {
            const selection = container.querySelector(".ReactCrop__crop-selection") as HTMLElement;
            expect(selection).not.toBeNull();
            const width = parseFloat(selection.style.width);
            const height = parseFloat(selection.style.height);
            return width / height;
        }

        test("renders the custom ratio when both sides are numeric literals", () => {
            const { container } = renderStaticPreview({ customAspectWidth: "3", customAspectHeight: "2" });
            // 3:2 box over a 400x300 image, expressed in % of each axis.
            expect(selectionAspect(container)).toBeCloseTo((3 / 2) * (300 / 400), 3);
        });

        test("falls back to free aspect for an attribute/expression path", () => {
            const { container } = renderStaticPreview({
                customAspectWidth: "$currentObject/Width",
                customAspectHeight: "2"
            });
            // Free aspect seeds an 80% box matching the image's own ratio -> square in % terms.
            expect(selectionAspect(container)).toBeCloseTo(1, 3);
        });

        test("does not throw when both sides are empty", () => {
            expect(() => renderStaticPreview({ customAspectWidth: "", customAspectHeight: "" })).not.toThrow();
        });
    });
});
