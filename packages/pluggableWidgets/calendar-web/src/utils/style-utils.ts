import { CSSProperties } from "react";
import { CalendarContainerProps } from "../../typings/CalendarProps";

function getHeightScale(height: number, heightUnit: "pixels" | "percentageOfParent" | "percentageOfView"): string {
    return `${height}${heightUnit === "pixels" ? "px" : heightUnit === "percentageOfView" ? "vh" : "%"}`;
}

export type WrapperStyleProps = Pick<
    CalendarContainerProps,
    | "widthUnit"
    | "heightUnit"
    | "minHeightUnit"
    | "maxHeightUnit"
    | "width"
    | "height"
    | "minHeight"
    | "maxHeight"
    | "overflowY"
    | "style"
>;

export function constructWrapperStyle(props: WrapperStyleProps): CSSProperties {
    const {
        widthUnit,
        heightUnit,
        minHeightUnit,
        maxHeightUnit,
        width,
        height,
        minHeight,
        maxHeight,
        overflowY,
        style
    } = props;

    const wrapperStyle: Pick<CSSProperties, "width" | "height" | "minHeight" | "maxHeight" | "overflowY"> = {};

    wrapperStyle.width = `${width}${widthUnit === "pixels" ? "px" : "%"}`;
    if (heightUnit === "percentageOfWidth") {
        wrapperStyle.height = "auto";

        if (minHeightUnit !== "none") {
            wrapperStyle.minHeight = getHeightScale(minHeight, minHeightUnit);
        }

        if (maxHeightUnit !== "none") {
            wrapperStyle.maxHeight = getHeightScale(maxHeight, maxHeightUnit);
            wrapperStyle.overflowY = overflowY;
        }
    } else {
        wrapperStyle.height = getHeightScale(height, heightUnit);
    }

    return { ...style, ...wrapperStyle };
}
