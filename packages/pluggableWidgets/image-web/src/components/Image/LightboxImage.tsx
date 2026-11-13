import classNames from "classnames";
import { CSSProperties, ReactElement, SyntheticEvent, useCallback, useState } from "react";

export interface ImageSize {
    width: number;
    height: number;
}

export interface LightboxImageProps {
    image: string | undefined;
    className?: string;
    style?: CSSProperties;
    altText?: string;
    /** The size of the image on the page. The enlarged image is never shown smaller than this. */
    minSize?: ImageSize;
}

/**
 * Style properties of the image on the page that only make sense for the box it has on the page. The enlarged
 * image gets its size from `Image.scss` and `getLightboxImageWidth` instead.
 */
const PAGE_ONLY_STYLE_PROPERTIES = [
    "width",
    "height",
    "minWidth",
    "minHeight",
    "maxWidth",
    "maxHeight",
    "aspectRatio",
    "objectFit",
    "objectPosition"
] as const;

export function getLightboxImageStyle(style: CSSProperties | undefined): CSSProperties | undefined {
    if (!style) {
        return style;
    }
    const rest: CSSProperties = { ...style };
    for (const property of PAGE_ONLY_STYLE_PROPERTIES) {
        delete rest[property];
    }
    return rest;
}

/**
 * The enlarged image shows at its natural size, but at least at the size of the image on the page. It is scaled
 * down to fit the viewport, keeping the aspect ratio of the image. Returns `undefined` when the natural size is
 * large enough, so that `Image.scss` alone sizes the image.
 */
export function getLightboxImageWidth(naturalSize: ImageSize, minSize: ImageSize | undefined): string | undefined {
    if (!minSize || naturalSize.width <= 0 || naturalSize.height <= 0) {
        return undefined;
    }
    const ratio = naturalSize.width / naturalSize.height;
    const width = Math.ceil(Math.max(minSize.width, minSize.height * ratio));
    if (width <= naturalSize.width) {
        return undefined;
    }
    return `min(${width}px, var(--mx-image-viewer-lightbox-max-width), calc(var(--mx-image-viewer-lightbox-max-height) * ${ratio}))`;
}

export function LightboxImage({ image, className, style, altText, minSize }: LightboxImageProps): ReactElement {
    const [naturalSize, setNaturalSize] = useState<ImageSize>();

    const onLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = event.currentTarget;
        setNaturalSize({ width: naturalWidth, height: naturalHeight });
    }, []);

    const width = naturalSize ? getLightboxImageWidth(naturalSize, minSize) : undefined;

    return (
        <img
            className={classNames("mx-image-viewer-lightbox-image", className)}
            src={image}
            style={{ ...getLightboxImageStyle(style), width }}
            alt={altText}
            role="img"
            onLoad={onLoad}
        />
    );
}
