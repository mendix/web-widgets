import { ValueStatus } from "mendix";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
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
 * Imperative, React-owned dependencies the store needs but must not own itself:
 * a live DOM <img>, the blob-URL preview lifecycle, the original-image capture, and
 * the internal-change flag. All are stable except getImage/getOriginal, which read
 * refs — so they are re-injected each render via {@link ImageCropperStore.setDeps}.
 */
export interface CropperDeps {
    getImage: () => HTMLImageElement | null;
    showPreview: (file: File) => void;
    markInternalChange: () => void;
    getOriginal: () => File | undefined;
}

const NOOP_DEPS: CropperDeps = {
    getImage: () => null,
    showPreview: () => undefined,
    markInternalChange: () => undefined,
    getOriginal: () => undefined
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

    private gate: DerivedPropsGate<ImageCropperContainerProps>;
    private deps: CropperDeps = NOOP_DEPS;

    // Imperative interaction state — never drives render, so deliberately non-observable.
    private userDragged = false;
    private userInteracted = false;
    private applyDebouncedFn: (() => void) | undefined = undefined;
    private abort: (() => void) | undefined = undefined;

    constructor(gate: DerivedPropsGate<ImageCropperContainerProps>) {
        this.gate = gate;
        this.zoom = Number(gate.props.minZoom);
        // Explicit annotations (not makeAutoObservable): only the crop-domain working state is
        // observable; gate/deps and the imperative apply gate stay plain. Reference-typed crop
        // values use observable.ref (we always replace, never mutate in place).
        makeObservable<this, "props" | "applyCrop" | "applyNow" | "applyDebounced" | "armed">(this, {
            liveCrop: observable.ref,
            committedCrop: observable.ref,
            zoom: observable,
            grayscale: observable,
            zoomAnchor: observable.ref,
            props: computed,
            aspect: computed,
            setLiveCrop: action,
            markUserDragged: action,
            commitCrop: action,
            setZoom: action,
            toggleGrayscale: action,
            rotate: action,
            reset: action,
            initFromImageLoad: action,
            onImageChanged: action,
            // applyCrop/applyNow/applyDebounced/armed read or write only the non-observable
            // apply gate (userInteracted); they are intentionally NOT actions.
            applyCrop: false,
            applyNow: false,
            applyDebounced: false,
            armed: false
        });
    }

    private get props(): ImageCropperContainerProps {
        return this.gate.props;
    }

    get aspect(): number | undefined {
        return resolveAspectRatio(this.props.aspectRatio, this.props.customAspectWidth, this.props.customAspectHeight);
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
        return abort;
    }

    // Re-injected every render (getImage/getOriginal close over React refs).
    setDeps(deps: CropperDeps): void {
        this.deps = deps;
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

    setZoom(next: number): void {
        // Freeze the anchor at the current box center. Recomputing it only here (not while the
        // box moves) keeps the image stable during drags but still zooms into the box.
        const live = this.liveCrop;
        if (live && live.unit === "%") {
            this.zoomAnchor = { x: (live.x + live.width / 2) / 100, y: (live.y + live.height / 2) / 100 };
        }
        this.zoom = next;
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
            this.deps.showPreview(working);
            this.deps.markInternalChange();
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
        const file = this.deps.getOriginal();
        if (file && !image.readOnly && image.status === ValueStatus.Available) {
            // Mirror rotate: setValue defers the commit, so drive the live preview with the
            // original bytes too — otherwise a stale rotated blob keeps rendering after Reset.
            this.deps.showPreview(file);
            this.deps.markInternalChange();
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
        this.liveCrop = percentCrop;
        this.committedCrop = pixelCrop;
        this.armed(); // programmatic load must not auto-commit
    }

    // Inbound sync: called from a React effect when the bound image uri changes.
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
            this.deps.markInternalChange();
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
