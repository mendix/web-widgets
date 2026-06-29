import { act, fireEvent, render, screen } from "@testing-library/react";
import { Big } from "big.js";
import { ValueStatus } from "mendix";
import { Ref } from "react";
import type { Crop, PixelCrop } from "react-image-crop";
import { actionValue } from "@mendix/widget-plugin-test-utils";
import type { ImageCropperContainerProps } from "../../typings/ImageCropperProps";

// Integration test: proves the rotate/grayscale actions reach the right util with the right args.

interface CapturedCropArea {
    onImageLoad: (percentCrop: Crop, pixelCrop: PixelCrop) => void;
    onCropComplete: (pixelCrop: PixelCrop) => void;
    onUserInteractStart?: () => void;
}
let captured: CapturedCropArea;

jest.mock("../components/CropArea", () => ({
    CropArea: (props: {
        imageRef: Ref<HTMLImageElement>;
        onImageLoad: CapturedCropArea["onImageLoad"];
        onCropComplete: CapturedCropArea["onCropComplete"];
        onUserInteractStart?: CapturedCropArea["onUserInteractStart"];
    }) => {
        captured = {
            onImageLoad: props.onImageLoad,
            onCropComplete: props.onCropComplete,
            onUserInteractStart: props.onUserInteractStart
        };
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

interface CapturedRotateOptions {
    rotation: number;
    outputFormat: string;
    grayscale: boolean;
}
const rotateImageOptions: CapturedRotateOptions[] = [];
jest.mock("../utils/rotateImage", () => ({
    rotateImage: jest.fn((options: CapturedRotateOptions) => {
        rotateImageOptions.push(options);
        return Promise.resolve(new File(["x"], "rotate.png", { type: "image/png" }));
    })
}));

interface CapturedCropOptions {
    grayscale: boolean;
}
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

describe("<ImageCropper> rotation/grayscale integration", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        rotateImageOptions.length = 0;
        cropImageOptions.length = 0;
        global.fetch = jest.fn().mockRejectedValue(new Error("no-net")) as jest.Mock;
        // jsdom lacks blob URL APIs used by the live-preview hook.
        (URL as unknown as { createObjectURL: () => string }).createObjectURL = () => "blob:test";
        (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => undefined;
    });
    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test("rotate-right calls rotateImage with rotation=90 and writes the result via setValue", async () => {
        const image = makeImageProp();
        render(<ImageCropper {...makeProps({ image })} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        await act(async () => {
            fireEvent.click(screen.getByLabelText("Flip right"));
            await Promise.resolve();
            await Promise.resolve();
        });
        expect(rotateImageOptions.length).toBeGreaterThan(0);
        expect(rotateImageOptions[rotateImageOptions.length - 1].rotation).toBe(90);
        expect(image.setValue).toHaveBeenCalledWith(expect.any(File));
    });

    test("flip with grayscale on bakes grayscale into the COMMITTED file", async () => {
        // handleFlip also produces a color working image (first call, grayscale:false);
        // the last call is the baked commit (grayscale:true) used for setValue.
        render(<ImageCropper {...makeProps()} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        act(() => {
            fireEvent.click(screen.getByLabelText("Grayscale"));
        });
        await act(async () => {
            fireEvent.click(screen.getByLabelText("Flip right"));
            await Promise.resolve();
            await Promise.resolve();
        });
        expect(rotateImageOptions[rotateImageOptions.length - 1].grayscale).toBe(true);
    });

    test("rotate-left calls rotateImage with rotation=-90", async () => {
        render(<ImageCropper {...makeProps()} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        await act(async () => {
            fireEvent.click(screen.getByLabelText("Flip left"));
            await Promise.resolve();
            await Promise.resolve();
        });
        expect(rotateImageOptions[rotateImageOptions.length - 1].rotation).toBe(-90);
    });

    test("subsequent crop-complete after rotate calls cropImage without a rotation field", async () => {
        render(<ImageCropper {...makeProps()} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        await act(async () => {
            fireEvent.click(screen.getByLabelText("Flip right"));
            await Promise.resolve();
            await Promise.resolve();
        });
        cropImageOptions.length = 0;
        act(() => {
            captured.onUserInteractStart?.();
        });
        act(() => {
            captured.onCropComplete(PIXEL_CROP);
        });
        await flushApply();
        expect(cropImageOptions.length).toBeGreaterThan(0);
        expect(cropImageOptions[cropImageOptions.length - 1]).not.toHaveProperty("rotation");
    });

    test("black & white toggle then crop-complete passes grayscale=true to cropImage", async () => {
        render(<ImageCropper {...makeProps()} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        act(() => {
            fireEvent.click(screen.getByLabelText("Grayscale"));
        });
        act(() => {
            captured.onUserInteractStart?.();
        });
        act(() => {
            captured.onCropComplete(PIXEL_CROP);
        });
        await flushApply();
        expect(cropImageOptions[cropImageOptions.length - 1].grayscale).toBe(true);
    });
});
