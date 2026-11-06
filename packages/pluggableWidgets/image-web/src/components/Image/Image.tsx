import { CSSProperties, FunctionComponent, ReactNode, useCallback } from "react";
import { ImageContentProps, ImageUi } from "./ui";
import { DisplayAsEnum, HeightUnitEnum, OnClickTypeEnum, WidthUnitEnum } from "../../../typings/ImageProps";
import { useLightboxState } from "../../utils/lightboxState";
import { Lightbox, LightboxProps } from "../Lightbox";

import "../../ui/Image.scss";
import classNames from "classnames";

export type ImageType = {
    type: "image" | "icon" | "glyph";
    image: string | undefined;
};

export interface ImageProps extends ImageType {
    class: string;
    style?: CSSProperties;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
    tabIndex?: number;
    iconSize: number;
    responsive: boolean;
    onClickType: OnClickTypeEnum;
    onClick?: () => void;
    altText?: string;
    displayAs: DisplayAsEnum;
    previewMode?: boolean;
    renderAsBackground: boolean;
    backgroundImageContent?: ReactNode;
}

function processImageLink(imageLink: string | undefined, displayAs: DisplayAsEnum): string | undefined {
    if (!imageLink || displayAs === "fullImage") {
        return imageLink;
    }
    const url = new URL(imageLink);
    url.searchParams.append("thumb", "true");
    return url.href;
}

/**
 * The enlarged image must not inherit the sizing of the image on the page: a percentage width would resolve
 * against the shrink-to-fit lightbox and a max height would cap it. Its size comes from `Image.scss` instead.
 */
function getLightboxImageStyle(style: CSSProperties | undefined): CSSProperties | undefined {
    if (!style) {
        return style;
    }
    const {
        width: _width,
        height: _height,
        minWidth: _minWidth,
        minHeight: _minHeight,
        maxWidth: _maxWidth,
        maxHeight: _maxHeight,
        ...rest
    } = style;
    return rest;
}

export const Image: FunctionComponent<ImageProps> = ({
    class: className,
    style,
    widthUnit,
    width,
    heightUnit,
    height,
    tabIndex,
    iconSize,
    responsive,
    onClickType,
    onClick,
    type,
    image,
    altText,
    displayAs,
    previewMode,
    renderAsBackground,
    backgroundImageContent
}) => {
    const { lightboxIsOpen, openLightbox, closeLightbox } = useLightboxState();

    const onCloseLightbox = useCallback<LightboxProps["onClose"]>(
        event => {
            event?.stopPropagation();
            closeLightbox();
        },
        [closeLightbox]
    );

    const onImageClick = useCallback<Exclude<ImageContentProps["onClick"], undefined>>(
        event => {
            event.stopPropagation();
            if (onClickType === "action") {
                onClick?.();
            } else if (onClickType === "enlarge") {
                openLightbox();
            }
        },
        [onClick, onClickType, openLightbox]
    );

    const hasClickHandler = (onClickType === "action" && onClick) || onClickType === "enlarge";
    const sharedContentProps: ImageContentProps = {
        style,
        tabIndex: tabIndex ?? 0,
        onClick: hasClickHandler ? onImageClick : undefined,
        altText
    };

    const content =
        type === "image" ? (
            <ImageUi.ContentImage
                className={classNames({ "img-thumbnail": displayAs === "thumbnail" })}
                image={previewMode ? image : processImageLink(image, displayAs)}
                height={height}
                heightUnit={heightUnit}
                width={width}
                widthUnit={widthUnit}
                {...sharedContentProps}
            />
        ) : (
            <ImageUi.ContentIcon icon={image} isGlyph={type === "glyph"} size={iconSize} {...sharedContentProps} />
        );

    if (renderAsBackground) {
        return (
            <ImageUi.BackgroundImage
                className={className}
                style={style}
                image={image}
                height={height}
                heightUnit={heightUnit}
                width={width}
                widthUnit={widthUnit}
                onClick={event => {
                    event.stopPropagation();
                    onClick?.();
                }}
            >
                {backgroundImageContent}
            </ImageUi.BackgroundImage>
        );
    }

    return (
        <ImageUi.Wrapper
            className={className}
            responsive={responsive}
            type={type}
            hasImage={image !== undefined && image.length > 0}
        >
            {content}
            {!previewMode && lightboxIsOpen && (
                <Lightbox isOpen={lightboxIsOpen} onClose={onCloseLightbox}>
                    {type === "image" ? (
                        <ImageUi.ContentImage
                            className={classNames({ "img-thumbnail": displayAs === "thumbnail" })}
                            image={image}
                            height={height}
                            heightUnit="auto"
                            width={width}
                            widthUnit="auto"
                            style={getLightboxImageStyle(style)}
                            altText={altText}
                        />
                    ) : (
                        content
                    )}
                </Lightbox>
            )}
        </ImageUi.Wrapper>
    );
};
