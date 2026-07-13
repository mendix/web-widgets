import { Big } from "big.js";
import { ValueStatus } from "mendix";
import type { Crop, PixelCrop } from "react-image-crop";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import type { ImageCropperContainerProps } from "../../../typings/ImageCropperProps";
import { CropperDeps, ImageCropperStore } from "../ImageCropperStore";

// The store calls cropImage/rotateImage (async canvas work). Mock them so the spec asserts
// orchestration (when/what is committed) without a real canvas.
jest.mock("../../utils/cropImage", () => {
    const actual = jest.requireActual("../../utils/cropImage");
    return {
        ...actual,
        cropImage: jest.fn(async () => new File(["cropped"], "cropped.png", { type: "image/png" }))
    };
});
jest.mock("../../utils/rotateImage", () => ({
    rotateImage: jest.fn(
        async (opts: { grayscale: boolean }) =>
            new File([opts.grayscale ? "bw" : "color"], "rotated.png", { type: "image/png" })
    )
}));

import { cropImage } from "../../utils/cropImage";
import { rotateImage } from "../../utils/rotateImage";

const PIXEL_CROP: PixelCrop = { unit: "px", x: 10, y: 10, width: 100, height: 100 };
const PERCENT_CROP: Crop = { unit: "%", x: 20, y: 20, width: 40, height: 40 };

type ImageProp = ImageCropperContainerProps["image"];
type WebImage = NonNullable<ImageProp["value"]>;

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
    } as unknown as ImageProp;
}

function makeProps(overrides: Partial<ImageCropperContainerProps> = {}): ImageCropperContainerProps {
    return {
        name: "imageCrop",
        class: "",
        tabIndex: 0,
        image: makeImageProp(),
        cropShape: "rect",
        aspectRatio: "square",
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
        outputFormat: "png",
        outputQuality: new Big(0.92),
        outputSize: "original",
        enableRotation: true,
        enableGrayscale: true,
        showResetButton: true,
        ...overrides
    } as ImageCropperContainerProps;
}

// A mutable gate whose props can be swapped, mimicking GateProvider.setProps.
class FakeGate implements DerivedPropsGate<ImageCropperContainerProps> {
    props: ImageCropperContainerProps;
    constructor(props: ImageCropperContainerProps) {
        this.props = props;
    }
}

// Minimal stand-in for the on-screen <img> the store reads for export/rotation math.
function fakeImage(): HTMLImageElement {
    return { naturalWidth: 400, naturalHeight: 300, width: 400, height: 300 } as HTMLImageElement;
}

function makeDeps(overrides: Partial<CropperDeps> = {}): jest.Mocked<CropperDeps> {
    return {
        getImage: jest.fn(() => fakeImage()),
        showPreview: jest.fn(),
        markInternalChange: jest.fn(),
        getOriginal: jest.fn(() => undefined),
        ...overrides
    } as jest.Mocked<CropperDeps>;
}

// Build a store already wired up: gate + setup() (debounce armed) + deps injected.
function makeStore(propsOverride: Partial<ImageCropperContainerProps> = {}): {
    store: ImageCropperStore;
    gate: FakeGate;
    deps: jest.Mocked<CropperDeps>;
    dispose: () => void;
} {
    const gate = new FakeGate(makeProps(propsOverride));
    const store = new ImageCropperStore(gate);
    const dispose = store.setup();
    const deps = makeDeps();
    store.setDeps(deps);
    return { store, gate, deps, dispose };
}

async function flush(): Promise<void> {
    jest.runOnlyPendingTimers();
    await Promise.resolve();
    await Promise.resolve();
}

describe("ImageCropperStore", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        (cropImage as jest.Mock).mockClear();
        (rotateImage as jest.Mock).mockClear();
    });
    afterEach(() => {
        jest.useRealTimers();
    });

    describe("initial state", () => {
        it("seeds zoom from minZoom prop and defaults", () => {
            const { store, dispose } = makeStore({ minZoom: new Big(2) });
            expect(store.zoom).toBe(2);
            expect(store.grayscale).toBe(false);
            expect(store.liveCrop).toBeUndefined();
            expect(store.committedCrop).toBeUndefined();
            dispose();
        });
    });

    describe("aspect computed", () => {
        it("derives from gate props and recomputes when props change", () => {
            const { store, gate, dispose } = makeStore({ aspectRatio: "square" });
            expect(store.aspect).toBe(1);
            gate.props = makeProps({ aspectRatio: "landscape16x9" });
            expect(store.aspect).toBeCloseTo(16 / 9);
            dispose();
        });
    });

    describe("commitCrop gate (user-drag vs programmatic)", () => {
        it("does NOT auto-commit a programmatic complete (no preceding drag)", async () => {
            const { store, deps, dispose } = makeStore();
            store.commitCrop(PIXEL_CROP);
            await flush();
            expect(store.committedCrop).toEqual(PIXEL_CROP);
            expect(deps.markInternalChange).not.toHaveBeenCalled();
            expect(cropImage).not.toHaveBeenCalled();
            dispose();
        });

        it("auto-commits immediately after a user drag, then disarms", async () => {
            const { store, gate, deps, dispose } = makeStore();
            store.markUserDragged();
            store.commitCrop(PIXEL_CROP);
            await flush();
            expect(cropImage).toHaveBeenCalledTimes(1);
            expect(deps.markInternalChange).toHaveBeenCalledTimes(1);
            expect(gate.props.image.setValue).toHaveBeenCalledTimes(1);

            // A subsequent programmatic complete must NOT commit (flag was reset).
            (cropImage as jest.Mock).mockClear();
            store.commitCrop({ ...PIXEL_CROP, x: 50 });
            await flush();
            expect(cropImage).not.toHaveBeenCalled();
            dispose();
        });
    });

    describe("setZoom", () => {
        it("freezes the anchor at the live-crop center and debounces the apply", async () => {
            const { store, deps, dispose } = makeStore();
            store.setLiveCrop(PERCENT_CROP);
            store.commitCrop(PIXEL_CROP); // programmatic — no commit yet
            store.setZoom(2);
            // anchor = box center: (x + w/2)/100, (y + h/2)/100 = (40/100, 40/100)
            expect(store.zoomAnchor).toEqual({ x: 0.4, y: 0.4 });
            expect(store.zoom).toBe(2);
            expect(cropImage).not.toHaveBeenCalled(); // still within debounce window
            await flush();
            expect(cropImage).toHaveBeenCalledTimes(1);
            expect(deps.markInternalChange).toHaveBeenCalledTimes(1);
            dispose();
        });

        it("coalesces rapid zoom changes into a single apply", async () => {
            const { store, dispose } = makeStore();
            store.commitCrop(PIXEL_CROP);
            store.setZoom(2);
            store.setZoom(3);
            store.setZoom(4);
            await flush();
            expect(cropImage).toHaveBeenCalledTimes(1);
            dispose();
        });
    });

    describe("no stale reads", () => {
        it("applies with the LATEST zoom/grayscale, not the value at trigger time", async () => {
            const { store, dispose } = makeStore();
            store.commitCrop(PIXEL_CROP);
            store.setZoom(2);
            store.toggleGrayscale(); // grayscale -> true, also schedules apply
            store.setZoom(3.5); // change again before the debounce fires
            await flush();
            expect(cropImage).toHaveBeenCalledTimes(1);
            const opts = (cropImage as jest.Mock).mock.calls[0][0];
            expect(opts.zoom).toBe(3.5);
            expect(opts.grayscale).toBe(true);
            dispose();
        });
    });

    describe("rotate", () => {
        it("commits a color file when grayscale is off and shows the working preview", async () => {
            const { store, gate, deps, dispose } = makeStore();
            await store.rotate(90);
            expect(rotateImage).toHaveBeenCalledTimes(1);
            expect((rotateImage as jest.Mock).mock.calls[0][0].grayscale).toBe(false);
            expect(deps.showPreview).toHaveBeenCalledTimes(1);
            expect(deps.markInternalChange).toHaveBeenCalledTimes(1);
            expect(gate.props.image.setValue).toHaveBeenCalledTimes(1);
            expect(store.liveCrop).toBeUndefined();
            expect(store.committedCrop).toBeUndefined();
            dispose();
        });

        it("bakes a separate B&W committed file when grayscale is on", async () => {
            const { store, dispose } = makeStore();
            store.toggleGrayscale();
            await store.rotate(-90);
            // Two rotateImage calls: color working + B&W committed.
            expect(rotateImage).toHaveBeenCalledTimes(2);
            const grayscales = (rotateImage as jest.Mock).mock.calls.map(c => c[0].grayscale);
            expect(grayscales).toEqual([false, true]);
            dispose();
        });
    });

    describe("reset", () => {
        it("restores zoom/grayscale, re-seeds the crop, and restores original bytes", () => {
            const original = new File(["orig"], "img.png", { type: "image/png" });
            const gate = new FakeGate(makeProps({ minZoom: new Big(1) }));
            const store = new ImageCropperStore(gate);
            const dispose = store.setup();
            const deps = makeDeps({ getOriginal: jest.fn(() => original) });
            store.setDeps(deps);

            store.toggleGrayscale();
            store.setZoom(3);
            store.reset();

            expect(store.zoom).toBe(1);
            expect(store.grayscale).toBe(false);
            expect(store.zoomAnchor).toEqual({ x: 0.5, y: 0.5 });
            expect(deps.showPreview).toHaveBeenCalledWith(original);
            expect(deps.markInternalChange).toHaveBeenCalled();
            expect(gate.props.image.setValue).toHaveBeenCalledWith(original);
            expect(store.liveCrop).toBeDefined(); // re-seeded from the fake image
            dispose();
        });
    });

    describe("onImageChanged (inbound sync)", () => {
        it("clears the crop and disarms so a queued apply cannot fire", async () => {
            const { store, deps, dispose } = makeStore();
            store.markUserDragged();
            store.commitCrop(PIXEL_CROP);
            await flush();
            (cropImage as jest.Mock).mockClear();
            (deps.markInternalChange as jest.Mock).mockClear();

            store.setZoom(2); // arms + schedules a debounced apply
            store.onImageChanged(); // new image arrived: disarm + clear
            await flush();

            expect(store.liveCrop).toBeUndefined();
            expect(store.committedCrop).toBeUndefined();
            expect(cropImage).not.toHaveBeenCalled(); // disarmed before the debounce fired
            dispose();
        });
    });

    describe("guards / no feedback loop", () => {
        it("does not write back when the image is read-only", async () => {
            const { store, gate, dispose } = makeStore();
            gate.props = makeProps({ image: makeImageProp({ readOnly: true } as Partial<ImageProp>) });
            store.markUserDragged();
            store.commitCrop(PIXEL_CROP);
            await flush();
            expect(cropImage).not.toHaveBeenCalled();
            expect(gate.props.image.setValue).not.toHaveBeenCalled();
            dispose();
        });

        it("does nothing when no committed crop exists", async () => {
            const { store, dispose } = makeStore();
            store.setZoom(2); // arms + debounces, but committedCrop is undefined
            await flush();
            expect(cropImage).not.toHaveBeenCalled();
            dispose();
        });
    });
});
