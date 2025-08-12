import { CSSProperties } from "react";
import { ImageContainerProps } from "typings/ImageProps";

function getHeightScale(height: number, heightUnit: "pixels" | "percentage" | "viewport"): string {
    return `${height}${heightUnit === "pixels" ? "px" : heightUnit === "viewport" ? "vh" : "%"}`;
}

export function constructStyleObject(props: ImageContainerProps): CSSProperties {
    const { widthUnit, heightUnit, minHeightUnit, maxHeightUnit, width, height, minHeight, maxHeight } = props;

    const imageStyle: Pick<CSSProperties, "width" | "height" | "minHeight" | "maxHeight" | "maxWidth"> = {};

    imageStyle.width = `${width}${widthUnit === "pixels" ? "px" : "%"}`;
    if (heightUnit === "auto") {
        imageStyle.height = "auto";

        if (minHeightUnit !== "none" && minHeight > 0) {
            console.warn(minHeight);
            imageStyle.minHeight = getHeightScale(minHeight, minHeightUnit);
        }

        if (maxHeightUnit !== "none" && maxHeight > 0) {
            imageStyle.maxHeight = getHeightScale(maxHeight, maxHeightUnit);
        }
    } else {
        imageStyle.height = getHeightScale(height, heightUnit);
    }

    return imageStyle;
}
