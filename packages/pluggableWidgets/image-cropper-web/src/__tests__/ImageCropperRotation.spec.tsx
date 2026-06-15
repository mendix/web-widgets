import { act, fireEvent, render, screen } from "@testing-library/react";
import { Big } from "big.js";
import { ValueStatus } from "mendix";
import { Ref } from "react";
import type { Crop, PixelCrop } from "react-image-crop";
import { actionValue } from "@mendix/widget-plugin-test-utils";
import type { ImageCropperContainerProps } from "../../typings/ImageCropperProps";

// Minimal shape of the cropImage options we assert on (avoids importing from the mocked module).
interface CapturedCropOptions {
    rotation: number;
    grayscale: boolean;
}

// Integration test: proves the rotation/grayscale state set via the toolbar buttons
// actually reaches cropImage when a crop is applied — the end-to-end ref plumbing,
// not just "the button fired a callback". We mock cropImage to capture its options.

interface CapturedCropArea {
    onImageLoad: (percentCrop: Crop, pixelCrop: PixelCrop) => void;
    onCropComplete: (pixelCrop: PixelCrop) => void;
}
let captured: CapturedCropArea;

jest.mock("../components/CropArea", () => ({
    CropArea: (props: {
        imageRef: Ref<HTMLImageElement>;
        onImageLoad: CapturedCropArea["onImageLoad"];
        onCropComplete: CapturedCropArea["onCropComplete"];
    }) => {
        captured = { onImageLoad: props.onImageLoad, onCropComplete: props.onCropComplete };
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

const cropImageOptions: CapturedCropOptions[] = [];
jest.mock("../utils/cropImage", () => ({
    CropError: class CropError extends Error {},
    cropImage: jest.fn((options: CapturedCropOptions) => {
        cropImageOptions.push(options);
        return Promise.resolve(new File(["x"], "crop.png", { type: "image/png" }));
    })
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
        enableRotation: true,
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

describe("<ImageCropper> rotation/grayscale integration", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        cropImageOptions.length = 0;
        global.fetch = jest.fn().mockRejectedValue(new Error("no-net")) as jest.Mock;
    });
    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test("rotate-right then crop-complete passes rotation=90 to cropImage", async () => {
        render(<ImageCropper {...makeProps()} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        // Click rotate-right: sets rotation state to 90, which the next render writes into rotationRef.
        act(() => {
            fireEvent.click(screen.getByLabelText("Rotate right"));
        });
        // A user crop release applies immediately, reading the now-current rotationRef.
        act(() => {
            captured.onCropComplete(PIXEL_CROP);
        });
        await flushApply();
        expect(cropImageOptions.length).toBeGreaterThan(0);
        expect(cropImageOptions[cropImageOptions.length - 1].rotation).toBe(90);
    });

    test("black & white toggle then crop-complete passes grayscale=true to cropImage", async () => {
        render(<ImageCropper {...makeProps()} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        act(() => {
            fireEvent.click(screen.getByLabelText("Black and white"));
        });
        act(() => {
            captured.onCropComplete(PIXEL_CROP);
        });
        await flushApply();
        expect(cropImageOptions[cropImageOptions.length - 1].grayscale).toBe(true);
    });
});
