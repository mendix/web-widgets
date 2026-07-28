import { Big } from "big.js";
import { DynamicValue, ValueStatus } from "mendix";
import { action, computed, makeObservable, observable, reaction, runInAction } from "mobx";
import { type SetStateAction } from "react";
import { type Crop, type PixelCrop } from "react-image-crop";
import { DerivedPropsGate, SetupComponent } from "@mendix/widget-plugin-mobx-kit/main";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { ImageCropperContainerProps } from "../../typings/ImageCropperProps";
import { resolveAspectRatio } from "../utils/aspectRatio";
import { CENTER_ANCHOR, CropError, cropImage, type ZoomAnchor } from "../utils/cropImage";
import { buildInitialCrop } from "../utils/initialCrop";
import { rotateImage } from "../utils/rotateImage";

const DEBOUNCE_MS = 400;

/**
 * The one imperative, React-owned dependency the store still needs but must not own itself:
 * the live on-screen DOM <img>, used as the canvas draw source for crop/rotate export. It
 * reads a ref, so it is re-injected each render via {@link ImageCropperStore.setDeps}. The
 * blob-URL preview, the original-image capture, and the internal-change flag were absorbed
 * into the store (they are pure browser resources, not React-lifecycle-bound in practice).
 */
export interface CropperDeps {
    getImage: () => HTMLImageElement | null;
}

const NOOP_DEPS: CropperDeps = {
    getImage: () => null
};

/**
 * Owns the crop-domain working state (crop box, zoom, grayscale, zoom anchor) and the
 * operations over it. Replaces the state-mirroring refs the React container needed: a
 * store method reads `this.zoom` directly, so it never goes stale inside the debounced
 * apply the way a stable-identity useCallback did.
 *
 * Controlled/uncontrolled: the ONLY externally controlled value is `props.image`
 * (an EditableValue). It is read live through the gate and written back via setValue.
 * Zoom/grayscale/crop are uncontrolled internal state. Config props (minZoom, cropShape,
 * outputFormat, …) are read live through the gate and never copied into observables.
 */
export class ImageCropperStore implements SetupComponent {
    // liveCrop: % units, updated per pointer move — survives container resize.
    liveCrop: Crop | undefined = undefined;
    // committedCrop: px units, set on release — consumed by cropImage on export.
    committedCrop: PixelCrop | undefined = undefined;
    zoom: number;
    grayscale = false;
    // Fixed point the CSS zoom pivots on; frozen at the box center when zoom changes so
    // the image stays put while the box moves. Drives CropArea transformOrigin AND export.
    zoomAnchor: ZoomAnchor = CENTER_ANCHOR;

    // Local blob: URL shown instead of the bound uri until the deferred setValue commits on
    // Save, or undefined to use the bound uri. Read by the container JSX. (was usePreviewSrc)
    previewSrc: string | undefined = undefined;
    // Whether the original bytes were captured, so Reset can restore them. Drives the Reset
    // button's enabled state. (was useOriginalImage's canRestore)
    canRestore = false;

    private gate: DerivedPropsGate<ImageCropperContainerProps>;
    private deps: CropperDeps = NOOP_DEPS;

    // Imperative interaction state — never drives render, so deliberately non-observable.
    private userDragged = false;
    private userInteracted = false;
    private applyDebouncedFn: (() => void) | undefined = undefined;
    private abort: (() => void) | undefined = undefined;

    // Image-capture / preview plumbing (was useOriginalImage + usePreviewSrc). Plain, not
    // observable: blobUrl/originalFile are browser resources; internalChange/capturedUri are
    // the fetch-dedupe gate that must not drive render.
    private originalFile: File | undefined = undefined;
    private blobUrl: string | undefined = undefined;
    private internalChange = false;
    // Bumped on every uri change so an in-flight fetch superseded by a newer uri is dropped
    // when it resolves (the reactive analog of useOriginalImage's `cancelled` guard).
    private fetchGeneration = 0;
    // Disposer for the uri reaction, torn down alongside the debounce in setup().
    private disposeUriEffect: (() => void) | undefined = undefined;
    // Disposer for the custom-ratio reaction (seeds/re-seeds the box once the ratio resolves).
    private disposeAspectEffect: (() => void) | undefined = undefined;

    constructor(gate: DerivedPropsGate<ImageCropperContainerProps>) {
        this.gate = gate;
        this.zoom = Number(gate.props.minZoom);
        // Explicit annotations (not makeAutoObservable): only the crop-domain working state is
        // observable; gate/deps and the imperative apply gate stay plain. Reference-typed crop
        // values use observable.ref (we always replace, never mutate in place).
        makeObservable<
            this,
            | "props"
            | "applyCrop"
            | "applyNow"
            | "applyDebounced"
            | "armed"
            | "onUriChanged"
            | "revokePreview"
            | "onAspectResolved"
        >(this, {
            liveCrop: observable.ref,
            committedCrop: observable.ref,
            zoom: observable,
            grayscale: observable,
            zoomAnchor: observable.ref,
            previewSrc: observable,
            canRestore: observable,
            props: computed,
            aspect: computed,
            aspectReady: computed,
            onAspectResolved: action,
            setLiveCrop: action,
            markUserDragged: action,
            commitCrop: action,
            setZoom: action,
            toggleGrayscale: action,
            rotate: action,
            reset: action,
            initFromImageLoad: action,
            onImageChanged: action,
            showPreview: action,
            // onUriChanged writes crop/preview/canRestore observables (fired by the reaction).
            onUriChanged: action,
            // applyCrop/applyNow/applyDebounced/armed read or write only the non-observable
            // apply gate (userInteracted); revokePreview touches only the plain blobUrl.
            // captureOriginal/markInternalChange wrap their own runInAction / touch plain state.
            applyCrop: false,
            applyNow: false,
            applyDebounced: false,
            armed: false,
            revokePreview: false
        });
    }

    private get props(): ImageCropperContainerProps {
        return this.gate.props;
    }

    get aspect(): number | undefined {
        const toNumber = (p: DynamicValue<Big>): number | undefined =>
            p.status === ValueStatus.Available && p.value ? p.value.toNumber() : undefined;
        return resolveAspectRatio(
            this.props.aspectRatio,
            toNumber(this.props.customAspectWidth),
            toNumber(this.props.customAspectHeight)
        );
    }

    /**
     * Whether the aspect ratio is known well enough to seed a crop box.
     *
     * `aspect` collapses three states into `number | undefined`: a resolved ratio, a resolved
     * "free" aspect, and "custom ratio not loaded yet". The last two both read as `undefined`,
     * which is why an unguarded seed picks free aspect and then visibly jumps once the
     * expression resolves. Only custom mode can be pending; every preset is synchronous.
     */
    get aspectReady(): boolean {
        if (this.props.aspectRatio !== "custom") {
            return true;
        }
        const isAvailable = (p: DynamicValue<Big>): boolean => p.status === ValueStatus.Available;
        return isAvailable(this.props.customAspectWidth) && isAvailable(this.props.customAspectHeight);
    }

    setup(): () => void {
        const [debounced, abort] = debounce(() => {
            if (this.userInteracted) {
                // Fire-and-forget: applyCrop swallows CropError itself; an unexpected throw
                // surfaces as an unhandled rejection (logged), same as the old hook.
                this.applyCrop();
            }
        }, DEBOUNCE_MS);
        this.applyDebouncedFn = debounced;
        this.abort = abort;

        // React to the bound image's uri changing (was useOriginalImage's [uri,name] effect +
        // the container's onImageChanged effect). The data fn reads the observable gate props,
        // so it re-tracks each render; the effect only fires when the derived uri value changes.
        this.disposeUriEffect = reaction(
            () => {
                const image = this.props.image;
                const value = image.status === ValueStatus.Available ? image.value : undefined;
                return { uri: value?.uri, name: value?.name };
            },
            ({ uri, name }) => this.onUriChanged(uri, name),
            // The data fn builds a fresh object literal every time props are swapped, and the
            // gate deliberately uses observable.ref (not struct), so default Object.is equality
            // would treat every render as a uri change and refetch/clear the crop. Compare by
            // value instead.
            { equals: (a, b) => a.uri === b.uri && a.name === b.name, fireImmediately: true }
        );

        // React to the resolved aspect ratio settling. The data fn emits `undefined` while the
        // custom ratio is pending, so a value -> pending transition fires nothing (the last box
        // is retained); only a genuine ratio value re-seeds. fireImmediately is deliberately OFF
        // — the initial box comes from CropArea's onLoad.
        this.disposeAspectEffect = reaction(
            () => (this.aspectReady ? this.aspect : undefined),
            aspect => {
                if (aspect === undefined && !this.aspectReady) {
                    return; // ratio went pending — keep the current box
                }
                this.onAspectResolved();
            }
        );

        // Combined teardown: stop the debounce, dispose both reactions, revoke any live blob.
        return () => {
            abort();
            this.disposeUriEffect?.();
            this.disposeAspectEffect?.();
            this.revokePreview();
        };
    }

    // Handles an image-uri change. Two branches:
    //  - internal bake (our own setValue): adopt the uri, don't refetch, keep the crop box;
    //  - external swap (a genuinely new image): capture original bytes for Reset, clear the
    //    crop + disarm, and drop any stale preview blob so the bound uri shows through.
    // Called by the setup() reaction (also fires immediately for the initial image).
    private onUriChanged(uri: string | undefined, name: string | undefined): void {
        // A fresh committed uri means the previous local preview is superseded — drop it
        // unconditionally (usePreviewSrc did this on ANY committed-uri change).
        this.revokePreview();
        this.previewSrc = undefined;

        if (!uri) {
            return;
        }

        if (this.internalChange) {
            // Our own bake produced this uri — adopt it, keep the original + crop, skip fetch.
            this.internalChange = false;
            return;
        }

        // A genuinely new external image arrived. Invalidate any in-flight fetch, reset the
        // capture state, clear the crop + disarm, then recapture the original bytes for Reset.
        const generation = ++this.fetchGeneration;
        this.originalFile = undefined;
        this.canRestore = false;
        this.onImageChanged();
        // Fire-and-forget: captureOriginal never rejects (it handles its own errors below), so
        // there's no floating-promise to await. Bare call keeps eslint's no-void rule happy.
        this.captureOriginal(uri, name, generation);
    }

    // Async original-bytes capture for Reset. Guarded by the generation token so a fetch
    // superseded by a newer uri is discarded when it resolves. (was useOriginalImage's fetch)
    private async captureOriginal(uri: string, name: string | undefined, generation: number): Promise<void> {
        try {
            const res = await fetch(uri);
            if (!res.ok) {
                throw new Error(`status ${res.status}`);
            }
            const blob = await res.blob();
            if (generation !== this.fetchGeneration) {
                return; // superseded by a newer uri — drop this result
            }
            runInAction(() => {
                this.originalFile = new File([blob], name ?? "original", { type: blob.type || "image/png" });
                this.canRestore = true;
            });
        } catch {
            if (generation === this.fetchGeneration) {
                runInAction(() => {
                    this.canRestore = false;
                });
            }
        }
    }

    // Re-injected every render (getImage closes over a React ref).
    setDeps(deps: CropperDeps): void {
        this.deps = deps;
    }

    // Show a baked File immediately via a local blob: URL, before the deferred setValue commit
    // changes the bound uri. Revokes any prior URL first. (was usePreviewSrc.showPreview)
    showPreview(file: File): void {
        this.revokePreview();
        const url = URL.createObjectURL(file);
        this.blobUrl = url;
        this.previewSrc = url;
    }

    // Revoke the live blob URL (browser resource cleanup). Called before the next showPreview,
    // when the bound uri catches up, and on teardown. Does not touch previewSrc — callers that
    // need the fallback-to-bound-uri behavior clear previewSrc themselves.
    private revokePreview(): void {
        if (this.blobUrl) {
            URL.revokeObjectURL(this.blobUrl);
            this.blobUrl = undefined;
        }
    }

    // Flag the next uri change as our own bake so the uri effect adopts it without refetching.
    // Called synchronously before every internal setValue. (was useOriginalImage.markInternalChange)
    private markInternalChange(): void {
        this.internalChange = true;
    }

    setLiveCrop(crop: Crop | undefined): void {
        this.liveCrop = crop;
    }

    markUserDragged(): void {
        this.userDragged = true;
    }

    commitCrop(pixelCrop: PixelCrop): void {
        this.committedCrop = pixelCrop;
        // A genuine user drag commits immediately and disarms; a programmatic onComplete
        // (e.g. the box the library seeds right after image load) only updates committedCrop.
        if (this.userDragged) {
            this.userDragged = false;
            this.applyNow();
        }
    }

    setZoom(next: SetStateAction<number>): void {
        // Accept the React setState contract (value or updater). The wheel-zoom hook drives
        // zoom with setZoom(prev => …), so the store — the owner of `zoom` — resolves the
        // updater against its own value instead of leaking that into the container.
        const value = typeof next === "function" ? next(this.zoom) : next;
        // Freeze the anchor at the current box center. Recomputing it only here (not while the
        // box moves) keeps the image stable during drags but still zooms into the box.
        const live = this.liveCrop;
        if (live && live.unit === "%") {
            this.zoomAnchor = { x: (live.x + live.width / 2) / 100, y: (live.y + live.height / 2) / 100 };
        }
        this.zoom = value;
        this.applyDebounced();
    }

    toggleGrayscale(): void {
        this.grayscale = !this.grayscale;
        this.applyDebounced();
    }

    async rotate(deltaDeg: number): Promise<void> {
        const img = this.deps.getImage();
        const image = this.props.image;
        if (!img || image.readOnly || image.status !== ValueStatus.Available || !image.value) {
            return;
        }
        try {
            // Working image is ALWAYS color so toggling grayscale OFF stays reversible.
            const working = await rotateImage({
                image: img,
                rotation: deltaDeg,
                outputFormat: this.props.outputFormat,
                outputQuality: Number(this.props.outputQuality),
                grayscale: false,
                originalName: image.value.name
            });
            // Commit a baked B&W file only while the toggle is ON, so a rotate-then-Save
            // with no further crop still persists grayscale.
            const committed = this.grayscale
                ? await rotateImage({
                      image: img,
                      rotation: deltaDeg,
                      outputFormat: this.props.outputFormat,
                      outputQuality: Number(this.props.outputQuality),
                      grayscale: true,
                      originalName: image.value.name
                  })
                : working;
            runInAction(() => {
                this.liveCrop = undefined;
                this.committedCrop = undefined;
                this.armed();
            });
            // Show COLOR working pixels; CropArea reloads from this blob and rebuilds a fresh
            // crop against the swapped dimensions on its onLoad. The CSS grayscale filter from
            // this.grayscale still renders gray on screen.
            this.showPreview(working);
            this.markInternalChange();
            image.setValue(committed);
        } catch (err) {
            if (err instanceof CropError) {
                console.error("[image-cropper-web] CropError:", err.message);
            } else {
                throw err;
            }
        }
    }

    reset(): void {
        this.zoom = Number(this.props.minZoom);
        this.zoomAnchor = CENTER_ANCHOR;
        this.grayscale = false;
        this.armed(); // do not auto-apply the reset itself
        const image = this.props.image;
        const file = this.originalFile;
        if (file && !image.readOnly && image.status === ValueStatus.Available) {
            // Mirror rotate: setValue defers the commit, so drive the live preview with the
            // original bytes too — otherwise a stale rotated blob keeps rendering after Reset.
            this.showPreview(file);
            this.markInternalChange();
            image.setValue(file);
        }
        // Re-seed the default cropbox. If restoring original bytes changed the uri (e.g. after a
        // rotation), CropArea's onLoad re-seeds again against the correct dimensions; when no
        // edit occurred the uri is unchanged and onLoad won't refire, so this direct re-seed is
        // what puts the box back.
        const img = this.deps.getImage();
        if (img && img.naturalWidth) {
            const { percentCrop, pixelCrop } = buildInitialCrop(img, this.aspect);
            this.liveCrop = percentCrop;
            this.committedCrop = pixelCrop;
        } else {
            this.liveCrop = undefined;
            this.committedCrop = undefined;
        }
    }

    initFromImageLoad(percentCrop: Crop, pixelCrop: PixelCrop): void {
        this.zoom = Number(this.props.minZoom);
        this.zoomAnchor = CENTER_ANCHOR;
        this.armed(); // programmatic load must not auto-commit

        // The image beat the custom-ratio expression. Seeding now would use free aspect (see
        // aspectReady) and snap when the real ratio lands, so leave the box unseeded and let
        // the aspect reaction seed it once — at the correct ratio.
        if (!this.aspectReady) {
            this.liveCrop = undefined;
            this.committedCrop = undefined;
            return;
        }

        this.liveCrop = percentCrop;
        this.committedCrop = pixelCrop;
    }

    /**
     * Runs when the resolved aspect ratio settles on a new value (fired by the setup() reaction,
     * which only tracks ready states — a transition into "pending" never reaches here, so the
     * last valid box survives an Available -> unavailable flip until a new ratio arrives).
     *
     * Rebuilds the box in one step via buildInitialCrop rather than letting ReactCrop reconcile
     * the old box against the new ratio, and stays disarmed so a ratio change alone never
     * commits a re-cropped image back to the bound attribute.
     */
    private onAspectResolved(): void {
        const img = this.deps.getImage();
        if (!img || !img.naturalWidth) {
            // No on-screen image yet; CropArea's onLoad will seed with the now-ready ratio.
            return;
        }
        const { percentCrop, pixelCrop } = buildInitialCrop(img, this.aspect);
        this.liveCrop = percentCrop;
        this.committedCrop = pixelCrop;
        this.armed(); // programmatic re-seed must not auto-commit
    }

    // Inbound sync: clear the crop box and disarm the apply gate when the bound image changes.
    // Called by onUriChanged's external-swap branch (was a React effect on the uri).
    onImageChanged(): void {
        this.liveCrop = undefined;
        this.committedCrop = undefined;
        this.armed();
    }

    // --- apply gate (was useAutoApplyCrop) ---------------------------------------------------

    private armed(): void {
        this.userInteracted = false;
    }

    private applyNow(): void {
        this.userInteracted = true;
        this.abort?.();
        // Fire-and-forget (see setup): applyCrop handles its own errors.
        this.applyCrop();
    }

    private applyDebounced(): void {
        this.userInteracted = true;
        this.applyDebouncedFn?.();
    }

    private async applyCrop(): Promise<void> {
        const img = this.deps.getImage();
        const committedCrop = this.committedCrop;
        const image = this.props.image;
        if (!img || !committedCrop || image.readOnly || image.status !== ValueStatus.Available || !image.value) {
            return;
        }
        try {
            const file = await cropImage({
                image: img,
                pixelCrop: committedCrop,
                zoom: this.zoom,
                zoomAnchor: this.zoomAnchor,
                outputFormat: this.props.outputFormat,
                outputQuality: Number(this.props.outputQuality),
                outputSize: this.props.outputSize,
                cropShape: this.props.cropShape,
                viewportWidth: this.props.boundaryWidth,
                viewportHeight: this.props.boundaryHeight,
                grayscale: this.grayscale,
                originalName: image.value.name
            });
            if (this.props.outputSize === "viewport") {
                image.setThumbnailSize(this.props.boundaryWidth, this.props.boundaryHeight);
            }
            this.markInternalChange();
            image.setValue(file);
            if (this.props.onCropAction?.canExecute) {
                this.props.onCropAction.execute();
            }
        } catch (err) {
            if (err instanceof CropError) {
                console.error("[image-cropper-web] CropError:", err.message);
            } else {
                console.error("[image-cropper-web] unexpected error:", err);
                throw err;
            }
        }
    }
}
