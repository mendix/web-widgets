import { Big } from "big.js";
import { ValueStatus } from "mendix";
import { action, makeObservable, observable } from "mobx";
import type { Crop, PixelCrop } from "react-image-crop";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import type { ImageCropperContainerProps } from "../../../typings/ImageCropperProps";

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
import { CropperDeps, ImageCropperStore } from "../ImageCropperStore";

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
        customAspectWidth: dynamic.available(new Big(1)),
        customAspectHeight: dynamic.available(new Big(1)),
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

// A mutable gate whose props can be swapped, mimicking GateProvider. props is observable.ref +
// setProps is an action, matching the real gate — the store's uri reaction and `aspect`/`props`
// computeds only re-evaluate when props is swapped through the observable, not a plain write.
class FakeGate implements DerivedPropsGate<ImageCropperContainerProps> {
    props: ImageCropperContainerProps;
    constructor(props: ImageCropperContainerProps) {
        this.props = props;
        makeObservable(this, { props: observable.ref, setProps: action });
    }
    setProps(props: ImageCropperContainerProps): void {
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
        ...overrides
    } as jest.Mocked<CropperDeps>;
}

// Build a store already wired up: gate + setup() (debounce armed + uri reaction) + deps injected.
// setup() runs the reaction with fireImmediately, so the initial image is captured right away;
// callers that assert on the fetch should `await flush()` first.
function makeStore(propsOverride: Partial<ImageCropperContainerProps> = {}): {
    store: ImageCropperStore;
    gate: FakeGate;
    deps: jest.Mocked<CropperDeps>;
    dispose: () => void;
} {
    const gate = new FakeGate(makeProps(propsOverride));
    const store = new ImageCropperStore(gate);
    const deps = makeDeps();
    store.setDeps(deps);
    const dispose = store.setup();
    return { store, gate, deps, dispose };
}

async function flush(): Promise<void> {
    jest.runOnlyPendingTimers();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
}

// jsdom implements neither blob URLs nor fetch; stub both so the store's preview + capture
// paths can run and be spied on.
if (!URL.createObjectURL) {
    (URL as unknown as { createObjectURL: () => string }).createObjectURL = () => "";
}
if (!URL.revokeObjectURL) {
    (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => undefined;
}

describe("ImageCropperStore", () => {
    let createSpy: jest.SpyInstance;
    let revokeSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.useFakeTimers();
        (cropImage as jest.Mock).mockClear();
        (rotateImage as jest.Mock).mockClear();

        let n = 0;
        createSpy = jest.spyOn(URL, "createObjectURL").mockImplementation(() => `blob:mock-${++n}`);
        revokeSpy = jest.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

        // Default: fetch succeeds with a tiny png blob (the initial-image capture the reaction
        // fires on setup). Individual tests override global.fetch as needed.
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            blob: () => Promise.resolve(new Blob(["orig"], { type: "image/png" }))
        }) as jest.Mock;
    });
    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
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
            gate.setProps(makeProps({ aspectRatio: "landscape16x9" }));
            expect(store.aspect).toBeCloseTo(16 / 9);
            dispose();
        });

        it("derives a custom ratio from the width/height expression values", () => {
            const { store, gate, dispose } = makeStore({
                aspectRatio: "custom",
                customAspectWidth: dynamic.available(new Big(16)),
                customAspectHeight: dynamic.available(new Big(9))
            });
            expect(store.aspect).toBeCloseTo(16 / 9);
            gate.setProps(
                makeProps({
                    aspectRatio: "custom",
                    customAspectWidth: dynamic.available(new Big(3)),
                    customAspectHeight: dynamic.available(new Big(2))
                })
            );
            expect(store.aspect).toBeCloseTo(3 / 2);
            dispose();
        });

        it("falls back to free aspect when a custom expression value is unavailable", () => {
            const { store, dispose } = makeStore({
                aspectRatio: "custom",
                customAspectWidth: dynamic.unavailable(),
                customAspectHeight: dynamic.available(new Big(9))
            });
            expect(store.aspect).toBeUndefined();
            dispose();
        });
    });

    // The custom ratio arrives asynchronously, so `aspect === undefined` is ambiguous: it means
    // both "free aspect" and "not loaded yet". aspectReady disambiguates, and the seeding path
    // must wait on it — otherwise the box seeds free and visibly jumps once the ratio lands.
    describe("custom ratio loading window", () => {
        const pendingCustom = {
            aspectRatio: "custom" as const,
            customAspectWidth: dynamic.loading<Big>(),
            customAspectHeight: dynamic.available(new Big(2))
        };
        const resolvedCustom = (w: number, h: number): Partial<ImageCropperContainerProps> => ({
            aspectRatio: "custom" as const,
            customAspectWidth: dynamic.available(new Big(w)),
            customAspectHeight: dynamic.available(new Big(h))
        });

        it("reports aspectReady=false only while a custom side is not Available", () => {
            const { store: pending, dispose: d1 } = makeStore(pendingCustom);
            expect(pending.aspectReady).toBe(false);
            d1();

            const { store: ready, dispose: d2 } = makeStore(resolvedCustom(3, 2));
            expect(ready.aspectReady).toBe(true);
            d2();

            // Presets resolve synchronously — never pending, even with unavailable custom sides.
            const { store: preset, dispose: d3 } = makeStore({
                aspectRatio: "square",
                customAspectWidth: dynamic.loading<Big>()
            });
            expect(preset.aspectReady).toBe(true);
            d3();
        });

        it("does not seed the crop box while the ratio is pending, then seeds once it resolves", () => {
            const { store, gate, dispose } = makeStore(pendingCustom);

            // The image finished loading before the expression did.
            store.initFromImageLoad(PERCENT_CROP, PIXEL_CROP);
            expect(store.liveCrop).toBeUndefined();
            expect(store.committedCrop).toBeUndefined();

            // Ratio lands: a single seed, at the resolved ratio (400x300 fake image, 3:2).
            gate.setProps(makeProps(resolvedCustom(3, 2)));
            expect(store.liveCrop).toBeDefined();
            const seeded = store.liveCrop!;
            expect(seeded.width / seeded.height).toBeCloseTo((3 / 2) * (300 / 400), 5);
            dispose();
        });

        it("re-seeds on a value-to-value ratio change without committing anything", async () => {
            const { store, gate, dispose } = makeStore(resolvedCustom(3, 2));
            store.initFromImageLoad(PERCENT_CROP, PIXEL_CROP);
            (gate.props.image.setValue as jest.Mock).mockClear();
            (cropImage as jest.Mock).mockClear();

            // e.g. a record swap hands over a different ratio.
            gate.setProps(makeProps(resolvedCustom(1, 1)));
            const reseeded = store.liveCrop!;
            expect(reseeded.width / reseeded.height).toBeCloseTo(1 * (300 / 400), 5);

            // A ratio change is programmatic — it must never push a re-cropped image back.
            await flush();
            expect(cropImage).not.toHaveBeenCalled();
            expect(gate.props.image.setValue).not.toHaveBeenCalled();
            dispose();
        });

        it("retains the last valid box when the ratio goes from Available to unavailable", () => {
            const { store, gate, dispose } = makeStore(resolvedCustom(3, 2));
            store.initFromImageLoad(PERCENT_CROP, PIXEL_CROP);
            const before = store.liveCrop;
            expect(before).toBeDefined();

            // Record changes: the expression briefly stops resolving. No free-aspect flash.
            gate.setProps(
                makeProps({
                    aspectRatio: "custom",
                    customAspectWidth: dynamic.loading<Big>(),
                    customAspectHeight: dynamic.loading<Big>()
                })
            );
            expect(store.liveCrop).toBe(before);
            dispose();
        });
    });

    describe("commitCrop gate (user-drag vs programmatic)", () => {
        it("does NOT auto-commit a programmatic complete (no preceding drag)", async () => {
            const { store, gate, dispose } = makeStore();
            store.commitCrop(PIXEL_CROP);
            await flush();
            expect(store.committedCrop).toEqual(PIXEL_CROP);
            expect(gate.props.image.setValue).not.toHaveBeenCalled();
            expect(cropImage).not.toHaveBeenCalled();
            dispose();
        });

        it("auto-commits immediately after a user drag, then disarms", async () => {
            const { store, gate, dispose } = makeStore();
            store.markUserDragged();
            store.commitCrop(PIXEL_CROP);
            await flush();
            expect(cropImage).toHaveBeenCalledTimes(1);
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
            const { store, gate, dispose } = makeStore();
            store.setLiveCrop(PERCENT_CROP);
            store.commitCrop(PIXEL_CROP); // programmatic — no commit yet
            store.setZoom(2);
            // anchor = box center: (x + w/2)/100, (y + h/2)/100 = (40/100, 40/100)
            expect(store.zoomAnchor).toEqual({ x: 0.4, y: 0.4 });
            expect(store.zoom).toBe(2);
            expect(cropImage).not.toHaveBeenCalled(); // still within debounce window
            await flush();
            expect(cropImage).toHaveBeenCalledTimes(1);
            expect(gate.props.image.setValue).toHaveBeenCalledTimes(1);
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
            const { store, gate, dispose } = makeStore();
            await flush(); // let the initial-image capture settle before asserting on preview
            createSpy.mockClear();
            await store.rotate(90);
            expect(rotateImage).toHaveBeenCalledTimes(1);
            expect((rotateImage as jest.Mock).mock.calls[0][0].grayscale).toBe(false);
            // showPreview minted a blob URL for the working file and exposed it.
            expect(createSpy).toHaveBeenCalledTimes(1);
            expect(store.previewSrc).toBe("blob:mock-1");
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
        it("restores zoom/grayscale, re-seeds the crop, and restores original bytes", async () => {
            const { store, gate, dispose } = makeStore({ minZoom: new Big(1) });
            // The initial-image reaction fetches + captures the original bytes for Reset.
            await flush();
            expect(store.canRestore).toBe(true);

            store.toggleGrayscale();
            store.setZoom(3);
            store.reset();

            expect(store.zoom).toBe(1);
            expect(store.grayscale).toBe(false);
            expect(store.zoomAnchor).toEqual({ x: 0.5, y: 0.5 });
            // Reset drives the live preview with the captured original and writes it back.
            expect(store.previewSrc).toBeDefined();
            const restored = (gate.props.image.setValue as jest.Mock).mock.calls.at(-1)?.[0];
            expect(restored).toBeInstanceOf(File);
            expect(restored.name).toBe("img.png"); // the captured original's name
            expect(store.liveCrop).toBeDefined(); // re-seeded from the fake image
            dispose();
        });
    });

    describe("onImageChanged (inbound sync)", () => {
        it("clears the crop and disarms so a queued apply cannot fire", async () => {
            const { store, dispose } = makeStore();
            store.markUserDragged();
            store.commitCrop(PIXEL_CROP);
            await flush();
            (cropImage as jest.Mock).mockClear();

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
            gate.setProps(makeProps({ image: makeImageProp({ readOnly: true } as Partial<ImageProp>) }));
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

    describe("original-image capture (was useOriginalImage)", () => {
        it("fetches the bound image and reports canRestore", async () => {
            const { store, dispose } = makeStore();
            await flush();
            expect(global.fetch).toHaveBeenCalledWith("http://localhost/img.png");
            expect(store.canRestore).toBe(true);
            dispose();
        });

        it("reports canRestore=false when the fetch fails", async () => {
            global.fetch = jest.fn().mockRejectedValue(new Error("CORS")) as jest.Mock;
            const { store, dispose } = makeStore();
            await flush();
            expect(store.canRestore).toBe(false);
            dispose();
        });

        it("re-captures and clears the crop when a new external uri arrives", async () => {
            const { store, gate, dispose } = makeStore();
            await flush();
            (global.fetch as jest.Mock).mockClear();
            store.setLiveCrop(PERCENT_CROP);
            store.commitCrop(PIXEL_CROP);

            // A genuinely new external image (no preceding internal bake).
            gate.setProps(
                makeProps({ image: makeImageProp({ value: { uri: "http://x/new.png", name: "new.png" } as WebImage }) })
            );
            await flush();

            expect(global.fetch).toHaveBeenCalledWith("http://x/new.png");
            expect(store.liveCrop).toBeUndefined();
            expect(store.committedCrop).toBeUndefined();
            dispose();
        });

        it("ignores a re-render that carries the same uri in a new props object", async () => {
            const { store, gate, dispose } = makeStore();
            await flush();
            (global.fetch as jest.Mock).mockClear();
            store.setLiveCrop(PERCENT_CROP);
            store.commitCrop(PIXEL_CROP);

            // React hands over a fresh props object on every parent re-render, and the gate uses
            // observable.ref by design — so identity alone must not count as an image change.
            gate.setProps(makeProps());
            await flush();

            expect(global.fetch).not.toHaveBeenCalled();
            expect(store.liveCrop).toEqual(PERCENT_CROP);
            expect(store.committedCrop).toEqual(PIXEL_CROP);
            dispose();
        });

        it("adopts our own bake's uri without refetching or clearing the crop", async () => {
            const { store, gate, dispose } = makeStore();
            store.markUserDragged();
            store.commitCrop(PIXEL_CROP);
            await flush(); // applyCrop -> markInternalChange -> setValue
            expect(store.committedCrop).toEqual(PIXEL_CROP);
            (global.fetch as jest.Mock).mockClear();

            // Simulate the deferred commit landing: the bound uri changes to our baked output.
            gate.setProps(
                makeProps({
                    image: makeImageProp({ value: { uri: "http://x/baked.png", name: "baked.png" } as WebImage })
                })
            );
            await flush();

            expect(global.fetch).not.toHaveBeenCalled(); // adopted, not recaptured
            expect(store.committedCrop).toEqual(PIXEL_CROP); // crop preserved
            dispose();
        });

        it("drops a superseded in-flight fetch (stale-fetch cancellation)", async () => {
            // First fetch never resolves within the window; a second uri supersedes it.
            let resolveFirst: (r: unknown) => void = () => undefined;
            const slowBlob = new Blob(["slow"], { type: "image/png" });
            global.fetch = jest
                .fn()
                .mockImplementationOnce(() => new Promise(res => (resolveFirst = res)))
                .mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(slowBlob) }) as jest.Mock;

            const { store, gate, dispose } = makeStore();
            // Supersede before the first fetch resolves.
            gate.setProps(
                makeProps({
                    image: makeImageProp({ value: { uri: "http://x/second.png", name: "second.png" } as WebImage })
                })
            );
            await flush();
            // Now resolve the STALE first fetch — it must be discarded (generation mismatch).
            resolveFirst({ ok: true, blob: () => Promise.resolve(new Blob(["stale"], { type: "image/png" })) });
            await flush();

            // canRestore reflects the SECOND (winning) fetch, not the stale first.
            expect(store.canRestore).toBe(true);
            dispose();
        });
    });

    describe("preview blob lifecycle (was usePreviewSrc)", () => {
        it("drops and revokes the preview when the committed uri catches up", async () => {
            const { store, gate, dispose } = makeStore();
            await flush();
            await store.rotate(90); // mints a preview blob (internal bake -> markInternalChange)
            expect(store.previewSrc).toBeDefined();
            const minted = store.previewSrc;
            revokeSpy.mockClear();

            // The deferred commit lands: bound uri becomes our baked output. onUriChanged drops
            // the local preview and revokes the blob (adopt branch, previewSrc cleared first).
            gate.setProps(
                makeProps({
                    image: makeImageProp({ value: { uri: "http://x/baked.png", name: "baked.png" } as WebImage })
                })
            );
            await flush();

            expect(store.previewSrc).toBeUndefined();
            expect(revokeSpy).toHaveBeenCalledWith(minted);
            dispose();
        });

        it("revokes the live blob URL on teardown", async () => {
            const { store, dispose } = makeStore();
            await flush();
            await store.rotate(90);
            const minted = store.previewSrc;
            revokeSpy.mockClear();
            dispose();
            expect(revokeSpy).toHaveBeenCalledWith(minted);
        });
    });
});
