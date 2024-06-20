import { CSSProperties } from "react";
import { RichTextContainerProps } from "typings/RichTextProps";

export function constructWrapperStyle(props: RichTextContainerProps, currentStyle: CSSProperties): CSSProperties {
    const { width, height } = currentStyle;
    const { minHeight, heightUnit, widthUnit } = props;

    const wrapperStyle: Pick<CSSProperties, "width" | "height" | "minHeight" | "maxWidth"> = { width, height };

    if (heightUnit !== "pixels") {
        wrapperStyle.minHeight = minHeight;
        delete wrapperStyle.height;
    }

    if (widthUnit === "pixels") {
        wrapperStyle.maxWidth = width;
    }

    return wrapperStyle;
}
