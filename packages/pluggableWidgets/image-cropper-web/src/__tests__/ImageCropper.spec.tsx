import { act, fireEvent, render, screen } from "@testing-library/react";
import { Big } from "big.js";
import { ValueStatus } from "mendix";
import { Ref } from "react";
import type { Crop, PixelCrop } from "react-image-crop";
import { actionValue } from "@mendix/widget-plugin-test-utils";
import type { ImageCropperContainerProps } from "../../typings/ImageCropperProps";

// Capture the container's callbacks via a mocked CropArea. Real ReactCrop only fires
// onComplete on pointer drags, which jsdom cannot simulate — so we drive the wiring directly.
interface CapturedCropArea {
    onImageLoad: (percentCrop: Crop, pixelCrop: PixelCrop) => void;
    onCropComplete: (pixelCrop: PixelCrop) => void;
    setZoom: (next: number) => void;
    wheelZoomMode: string;
}
let captured: CapturedCropArea;

jest.mock("../components/CropArea", () => ({
    CropArea: (props: {
        imageRef: Ref<HTMLImageElement>;
        onImageLoad: CapturedCropArea["onImageLoad"];
        onCropComplete: CapturedCropArea["onCropComplete"];
        setZoom: CapturedCropArea["setZoom"];
        wheelZoomMode: string;
    }) => {
        captured = {
            onImageLoad: props.onImageLoad,
            onCropComplete: props.onCropComplete,
            setZoom: props.setZoom,
            wheelZoomMode: props.wheelZoomMode
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

import { ImageCropper } from "../ImageCropper";

type ImageProp = ImageCropperContainerProps["image"];
type WebImage = NonNullable<ImageProp["value"]>;

const PIXEL_CROP: PixelCrop = { unit: "px", x: 10, y: 10, width: 100, height: 100 };
const PERCENT_CROP: Crop = { unit: "%", x: 5, y: 5, width: 50, height: 50 };

function makeImageProp(overrides: Partial<ImageProp> = {}): ImageProp {
    return {
        status: ValueStatus.Available,
        value: { uri: "http://localhost/img.png", name: "img.png" } as WebImage,
        readOnly: false,
        validation: undefined,
        setValidator: jest.fn(),
        setValue: jest.fn(),
        setThumbnailSize: jest.fn(),
        ...overrides
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
        enableRotation: true,
        enableGrayscale: false,
        showResetButton: true,
        onCropAction: actionValue(),
        ...overrides
    };
}

// Flush cropImage's async chain: microtasks + toBlob's setTimeout(0).
async function flushApply(): Promise<void> {
    await act(async () => {
        jest.runOnlyPendingTimers();
        await Promise.resolve();
        await Promise.resolve();
    });
}

describe("<ImageCropper>", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        global.fetch = jest.fn().mockRejectedValue(new Error("no-net")) as jest.Mock;
    });
    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test("renders skeleton while image is loading", () => {
        const props = makeProps({ image: makeImageProp({ status: ValueStatus.Loading, value: undefined }) });
        const { container } = render(<ImageCropper {...props} />);
        expect(container.querySelector(".widget-image-cropper--loading")).not.toBeNull();
    });

    test("renders empty state when image has no value", () => {
        const props = makeProps({ image: makeImageProp({ value: undefined }) });
        render(<ImageCropper {...props} />);
        expect(screen.getByText("No image")).toBeInTheDocument();
    });

    test("does NOT auto-apply on initial image load (no data mutation without user intent)", async () => {
        const image = makeImageProp();
        render(<ImageCropper {...makeProps({ image })} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
        });
        await flushApply();
        expect(image.setValue).not.toHaveBeenCalled();
    });

    test("auto-applies on crop release (setValue called once with a File)", async () => {
        const image = makeImageProp();
        render(<ImageCropper {...makeProps({ image })} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
            captured.onCropComplete(PIXEL_CROP);
        });
        await flushApply();
        expect(image.setValue).toHaveBeenCalledTimes(1);
        expect((image.setValue as jest.Mock).mock.calls[0][0]).toBeInstanceOf(File);
    });

    test("debounces zoom changes into a single apply", async () => {
        const image = makeImageProp();
        render(<ImageCropper {...makeProps({ image })} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
            captured.onCropComplete(PIXEL_CROP);
        });
        await flushApply();
        (image.setValue as jest.Mock).mockClear();

        act(() => {
            captured.setZoom(1.5);
            captured.setZoom(2);
            captured.setZoom(2.5);
        });
        // before the debounce window elapses, nothing applied
        expect(image.setValue).not.toHaveBeenCalled();
        await act(async () => {
            jest.advanceTimersByTime(400);
        });
        await flushApply();
        expect(image.setValue).toHaveBeenCalledTimes(1);
    });

    test("fires onCropAction after an applied crop", async () => {
        const action = actionValue();
        const image = makeImageProp();
        render(<ImageCropper {...makeProps({ image, onCropAction: action })} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
            captured.onCropComplete(PIXEL_CROP);
        });
        await flushApply();
        expect(action.execute).toHaveBeenCalledTimes(1);
    });

    test("read-only image does not apply on crop release", async () => {
        const image = makeImageProp({ readOnly: true });
        render(<ImageCropper {...makeProps({ image })} />);
        act(() => {
            captured.onImageLoad(PERCENT_CROP, PIXEL_CROP);
            captured.onCropComplete(PIXEL_CROP);
        });
        await flushApply();
        expect(image.setValue).not.toHaveBeenCalled();
    });

    test("shows zoom slider when zoomEnabled && showZoomSlider", () => {
        const { container } = render(<ImageCropper {...makeProps({ zoomEnabled: true, showZoomSlider: true })} />);
        expect(container.querySelector(".widget-image-cropper__zoom")).not.toBeNull();
    });

    test("hides slider when showZoomSlider is false (wheel zoom still wired via CropArea)", () => {
        const { container } = render(<ImageCropper {...makeProps({ zoomEnabled: true, showZoomSlider: false })} />);
        expect(container.querySelector(".widget-image-cropper__zoom")).toBeNull();
        // CropArea (wheel-zoom owner) still rendered
        expect(container.querySelector("img")).not.toBeNull();
    });

    test("hides slider when zoom disabled entirely", () => {
        const { container } = render(<ImageCropper {...makeProps({ zoomEnabled: false, showZoomSlider: true })} />);
        expect(container.querySelector(".widget-image-cropper__zoom")).toBeNull();
    });

    test("passes wheelZoomMode=off to CropArea when zoomEnabled is false", () => {
        render(<ImageCropper {...makeProps({ zoomEnabled: false, wheelZoomMode: "on" })} />);
        expect(captured.wheelZoomMode).toBe("off");
    });

    test("reset restores the captured original via setValue", async () => {
        const blob = new Blob(["x"], { type: "image/png" });
        global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) }) as jest.Mock;
        const image = makeImageProp();
        render(<ImageCropper {...makeProps({ image, showResetButton: true })} />);
        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });
        (image.setValue as jest.Mock).mockClear();
        fireEvent.click(screen.getByRole("button", { name: "Reset" }));
        await flushApply();
        expect((image.setValue as jest.Mock).mock.calls[0]?.[0]).toBeInstanceOf(File);
    });

    test("reset button disabled when original capture failed", async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error("CORS")) as jest.Mock;
        render(<ImageCropper {...makeProps({ showResetButton: true })} />);
        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });
        expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
    });
});
