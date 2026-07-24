import { ValueStatus } from "mendix";
import { FunctionComponent, useCallback } from "react";
import { ImageContainerProps } from "../typings/ImageProps";
import { Image as ImageComponent } from "./components/Image/Image";
import { constructStyleObject } from "./utils/helpers";
import { getImageProps } from "./utils/getImageProps";

export const Image: FunctionComponent<ImageContainerProps> = props => {
    const onClick = useCallback(() => props.onClick?.execute(), [props.onClick]);
    const { type, image } = getImageProps(props);

    const altText = props.alternativeText?.status === ValueStatus.Available ? props.alternativeText.value : undefined;
    const styleObject = type === "image" && constructStyleObject(props);

    const imageStyle = { ...props.style, ...styleObject };

    return image ? (
        <ImageComponent
            class={props.class}
            style={imageStyle}
            widthUnit={props.widthUnit}
            width={props.width}
            heightUnit={props.heightUnit}
            height={props.height}
            tabIndex={props.tabIndex}
            iconSize={props.iconSize}
            responsive={props.responsive}
            onClickType={props.onClickType}
            onClick={props.onClick ? onClick : undefined}
            type={type}
            image={image}
            altText={altText}
            displayAs={props.displayAs}
            renderAsBackground={props.datasource !== "icon" && props.isBackgroundImage}
            backgroundImageContent={props.children}
        />
    ) : null;
};
