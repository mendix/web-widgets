import { act, render } from "@testing-library/react";
import { Big } from "big.js";
import { ValueStatus } from "mendix";
import { Ref } from "react";
import type { Crop, PixelCrop } from "react-image-crop";
import { actionValue } from "@mendix/widget-plugin-test-utils";
import type { ImageCropperContainerProps } from "../../typings/ImageCropperProps";

// Multi-instance integration test: verifies that auto-commit only fires for the
// cropper instance where the user actually dragged, not for layout-driven completes
// or sibling instances.

interface CapturedCropArea {
    onImageLoad: (percentCrop: Crop, pixelCrop: PixelCrop) => void;
    onCropComplete: (pixelCrop: PixelCrop) => void;
    onUserInteractStart?: () => void;
}
const captures: CapturedCropArea[] = [];

jest.mock("../components/CropArea", () => ({
    CropArea: (props: {
        imageRef: Ref<HTMLImageElement>;
        onImageLoad: CapturedCropArea["onImageLoad"];
        onCropComplete: CapturedCropArea["onCropComplete"];
        onUserInteractStart?: CapturedCropArea["onUserInteractStart"];
    }) => {
        captures.push({
            onImageLoad: props.onImageLoad,
            onCropComplete: props.onCropComplete,
            onUserInteractStart: props.onUserInteractStart
        });
        return (
            <img
                alt=""
                ref={node => {
                    if (node) {
                        Object.defineProperty(node, "naturalWidth", { value: 400, configurable: true });
                        Object.defineProperty(node, "naturalHeight", { value: 300, configurable: true });
                        Object.defineProperty(node, "width", { value: 400, configurable: true });
                        Object.defineProperty(node, "height", { value: 300, configurable: true });
                    }
                    if (typeof props.imageRef === "function") {
                        props.imageRef(node);
                    } else if (props.imageRef) {
                        (props.imageRef as { current: HTMLImageElement | null }).current = node;
                    }
                }}
            />
        );
    }
}));

jest.mock("../utils/cropImage", () => ({
    CropError: class CropError extends Error {},
    cropImage: jest.fn(() => Promise.resolve(new File(["x"], "crop.png", { type: "image/png" })))
}));

jest.mock("../utils/rotateImage", () => ({
    rotateImage: jest.fn(() => Promise.resolve(new File(["x"], "rotate.png", { type: "image/png" })))
}));

import { ImageCropper } from "../ImageCropper";

type ImageProp = ImageCropperContainerProps["image"];
type WebImage = NonNullable<ImageProp["value"]>;

const PIXEL_CROP: PixelCrop = { unit: "px", x: 10, y: 10, width: 100, height: 100 };
const PERCENT_CROP: Crop = { unit: "%", x: 5, y: 5, width: 50, height: 50 };

function makeImageProp(): ImageProp {
    return {
        status: ValueStatus.Available,
        value: { uri: "http://localhost/img.png", name: "img.png" } as WebImage,
        readOnly: false,
        validation: undefined,
        setValidator: jest.fn(),
        setValue: jest.fn(),
        setThumbnailSize: jest.fn()
    } as ImageProp;
}

function makeProps(overrides: Partial<ImageCropperContainerProps> = {}): ImageCropperContainerProps {
    return {
        name: "imageCrop",
        class: "",
        style: undefined,
        tabIndex: 0,
        image: makeImageProp(),
        cropShape: "rect",
        aspectRatio: "free",
        customAspectWidth: 1,
        customAspectHeight: 1,
        boundaryWidth: 300,
        boundaryHeight: 300,
        resizableEnabled: true,
        enableFlip: true,
        enableGrayscale: true,
        showResetButton: true,
        zoomEnabled: true,
        showZoomSlider: true,
        wheelZoomMode: "onWithCtrl",
        minZoom: new Big(1),
        maxZoom: new Big(4),
        showPreview: false,
        previewWidth: 100,
        previewHeight: 100,
        outputFormat: "png",
        outputQuality: new Big(0.92),
        outputSize: "original",
        onCropAction: actionValue(),
        ...overrides
    };
}

async function flushApply(): Promise<void> {
    await act(async () => {
        jest.runOnlyPendingTimers();
        await Promise.resolve();
        await Promise.resolve();
    });
}

describe("<ImageCropper> multi-instance crop gating", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        captures.length = 0;
        global.fetch = jest.fn().mockRejectedValue(new Error("no-net")) as jest.Mock;
        (URL as unknown as { createObjectURL: () => string }).createObjectURL = () => "blob:test";
        (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => undefined;
    });
    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test("layout-driven onCropComplete without a user drag does not commit", async () => {
        const image = makeImageProp();
        render(<ImageCropper {...makeProps({ image })} />);
        act(() => {
            captures[0].onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        // layout-driven complete, NO preceding onUserInteractStart
        act(() => {
            captures[0].onCropComplete(PIXEL_CROP);
        });
        await flushApply();
        expect(image.setValue).not.toHaveBeenCalled();
    });

    test("a genuine user drag then onCropComplete DOES commit", async () => {
        const image = makeImageProp();
        render(<ImageCropper {...makeProps({ image })} />);
        act(() => {
            captures[0].onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        act(() => {
            captures[0].onUserInteractStart?.();
        }); // user grabs the crop
        act(() => {
            captures[0].onCropComplete(PIXEL_CROP);
        });
        await flushApply();
        expect(image.setValue).toHaveBeenCalled();
    });

    test("editing one cropper does not commit its sibling", async () => {
        const imageA = makeImageProp();
        const imageB = makeImageProp();
        render(
            <>
                <ImageCropper {...makeProps({ image: imageA, name: "A" })} />
                <ImageCropper {...makeProps({ image: imageB, name: "B" })} />
            </>
        );
        act(() => {
            captures[0].onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        act(() => {
            captures[1].onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        // only A receives a genuine user drag
        act(() => {
            captures[0].onUserInteractStart?.();
        });
        act(() => {
            captures[0].onCropComplete(PIXEL_CROP);
        });
        // B receives a layout-driven complete with NO drag signal — must NOT commit
        act(() => {
            captures[1].onCropComplete(PIXEL_CROP);
        });
        await flushApply();
        expect(imageA.setValue).toHaveBeenCalled();
        expect(imageB.setValue).not.toHaveBeenCalled();
    });
});
