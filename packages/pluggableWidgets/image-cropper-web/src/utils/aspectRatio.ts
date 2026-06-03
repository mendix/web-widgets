import { AspectRatioEnum } from "../../typings/ImageCropperProps";

export function resolveAspectRatio(
    aspect: AspectRatioEnum,
    customWidth: number,
    customHeight: number
): number | undefined {
    switch (aspect) {
        case "free":
            return undefined;
        case "square":
            return 1;
        case "landscape16x9":
            return 16 / 9;
        case "landscape4x3":
            return 4 / 3;
        case "portrait3x4":
            return 3 / 4;
        case "custom":
            if (customWidth > 0 && customHeight > 0) {
                return customWidth / customHeight;
            }
            return undefined;
        default: {
            const _exhaustive: never = aspect;
            return _exhaustive;
        }
    }
}
