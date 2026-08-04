import { AspectRatioEnum } from "../../typings/ImageCropperProps";

/**
 * Sentinel for "resolved, no constraint", so one `number | undefined` carries three states:
 * `undefined` = pending, `FREE_ASPECT` = free, positive = locked. Readiness is then just
 * `!== undefined`. Stripped by {@link toCropAspect} before reaching the crop layer.
 */
export const FREE_ASPECT = -1;

/**
 * Resolves the effective aspect ratio. A custom side of `undefined` means "not knowable yet";
 * zero or negative is knowable but unusable, so it degrades to free rather than staying pending.
 */
export function resolveAspectRatio(
    aspect: AspectRatioEnum,
    customWidth: number | undefined,
    customHeight: number | undefined
): number | undefined {
    switch (aspect) {
        case "free":
            return FREE_ASPECT;
        case "square":
            return 1;
        case "landscape16x9":
            return 16 / 9;
        case "landscape4x3":
            return 4 / 3;
        case "portrait3x4":
            return 3 / 4;
        case "custom":
            if (customWidth == null || customHeight == null) {
                return undefined; // still pending — distinct from free
            }
            if (customWidth > 0 && customHeight > 0) {
                return customWidth / customHeight;
            }
            return FREE_ASPECT; // resolved, but to an unusable ratio
        default: {
            const _exhaustive: never = aspect;
            return _exhaustive;
        }
    }
}

/**
 * Narrows to what the crop layer understands: a positive ratio, or `undefined` for unconstrained.
 * Pending and {@link FREE_ASPECT} both collapse — the difference only matters when deciding
 * whether to seed, never to the geometry.
 */
export function toCropAspect(aspect: number | undefined): number | undefined {
    return aspect !== undefined && aspect > 0 ? aspect : undefined;
}
