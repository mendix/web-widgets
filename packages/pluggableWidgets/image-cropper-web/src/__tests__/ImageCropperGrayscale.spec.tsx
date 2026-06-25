import { act, fireEvent, render, screen } from "@testing-library/react";
import { Big } from "big.js";
import { ValueStatus } from "mendix";
import { Ref } from "react";
import type { Crop, PixelCrop } from "react-image-crop";
import { actionValue } from "@mendix/widget-plugin-test-utils";
import type { ImageCropperContainerProps } from "../../typings/ImageCropperProps";

// Integration test: proves grayscale reversibility after flip.

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

describe("<ImageCropper> grayscale reversibility after flip", () => {
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

    test("flip with grayscale ON produces a COLOR working image (grayscale:false) so toggling off is reversible", async () => {
        render(<ImageCropper {...makeProps()} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        act(() => {
            fireEvent.click(screen.getByLabelText("Grayscale"));
        }); // ON
        rotateImageOptions.length = 0;
        await act(async () => {
            fireEvent.click(screen.getByLabelText("Flip right"));
            await Promise.resolve();
            await Promise.resolve();
        });
        // The WORKING image (the one shown + reloaded into imageRef) must be COLOR.
        // With approach B, handleFlip calls rotateImage twice: once color (working),
        // once baked (commit). The color call is the one whose result feeds the preview.
        const colorWorkingCall = rotateImageOptions.some(o => o.grayscale === false);
        expect(colorWorkingCall).toBe(true);
    });

    test("flip with grayscale ON still bakes a B&W file for the committed setValue", async () => {
        const image = makeImageProp();
        render(<ImageCropper {...makeProps({ image })} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        act(() => {
            fireEvent.click(screen.getByLabelText("Grayscale"));
        }); // ON
        rotateImageOptions.length = 0;
        await act(async () => {
            fireEvent.click(screen.getByLabelText("Flip right"));
            await Promise.resolve();
            await Promise.resolve();
        });
        // committed file must be the baked one
        expect(rotateImageOptions.some(o => o.grayscale === true)).toBe(true);
        expect(image.setValue).toHaveBeenCalledWith(expect.any(File));
    });

    test("flip with grayscale OFF produces only a color file (no baked B&W)", async () => {
        render(<ImageCropper {...makeProps()} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        rotateImageOptions.length = 0;
        await act(async () => {
            fireEvent.click(screen.getByLabelText("Flip right"));
            await Promise.resolve();
            await Promise.resolve();
        });
        expect(rotateImageOptions.every(o => o.grayscale === false)).toBe(true);
    });
});
