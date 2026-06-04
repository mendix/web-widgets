import { CSSProperties } from "react";
import { RichTextContainerProps } from "typings/RichTextProps";

export const INDENT_MAGIC_NUMBER = 3;
export const ACTION_DISPATCHER = "ACTION_DISPATCHER";

function getHeightScale(height: number, heightUnit: "pixels" | "percentageOfParent" | "percentageOfView"): string {
    return `${height}${heightUnit === "pixels" ? "px" : heightUnit === "percentageOfView" ? "vh" : "%"}`;
}

export function constructWrapperStyle(props: RichTextContainerProps): CSSProperties {
    const { widthUnit, heightUnit, minHeightUnit, maxHeightUnit, width, height, minHeight, maxHeight, OverflowY } =
        props;

    const wrapperStyle: Pick<CSSProperties, "width" | "height" | "minHeight" | "maxHeight" | "maxWidth" | "overflowY"> =
        {};

    wrapperStyle.width = `${width}${widthUnit === "pixels" ? "px" : "%"}`;
    if (heightUnit === "percentageOfWidth") {
        wrapperStyle.height = "auto";

        if (minHeightUnit !== "none") {
            wrapperStyle.minHeight = getHeightScale(minHeight, minHeightUnit);
        }

        if (maxHeightUnit !== "none") {
            wrapperStyle.maxHeight = getHeightScale(maxHeight, maxHeightUnit);
            wrapperStyle.overflowY = OverflowY;
        }
    } else {
        wrapperStyle.height = getHeightScale(height, heightUnit);
    }

    return wrapperStyle;
}

export function normalizeStyleAndClassAttribute(doc: Document, styleDataFormat: "inline" | "class"): void {
    if (styleDataFormat === "class") {
        const allIndentLeftElements = doc.querySelectorAll("[style*=padding-left]");
        const allIndentRightElements = doc.querySelectorAll("[style*=padding-right]");
        allIndentLeftElements.forEach(element => {
            const paddingLeft = (element as HTMLElement).style.paddingLeft || "0em";
            const indentValue = parseInt(paddingLeft.replace("px", "").replace("em", ""), 10);
            if (indentValue) {
                const indentClassValue = Math.round(indentValue / INDENT_MAGIC_NUMBER);
                element.classList.add(`ql-indent-${indentClassValue}`);
                (element as HTMLElement).style.removeProperty("padding-left");
            }
        });
        allIndentRightElements.forEach(element => {
            const paddingRight = (element as HTMLElement).style.paddingRight || "0em";
            const indentValue = parseInt(paddingRight.replace("px", "").replace("em", ""), 10);
            if (indentValue) {
                const indentClassValue = Math.round(indentValue / INDENT_MAGIC_NUMBER);
                element.classList.add(`ql-indent-${indentClassValue}`);
                (element as HTMLElement).style.removeProperty("padding-right");
            }
        });
    } else if (styleDataFormat === "inline") {
        const allIndentsElements = doc.querySelectorAll("[class*=ql-indent-]");
        allIndentsElements.forEach(element => {
            const indentClass = Array.from(element.classList).find(className => className.startsWith("ql-indent-"));
            if (indentClass) {
                const indentValue = parseInt(indentClass.replace("ql-indent-", ""), 10);
                if (indentValue) {
                    if (element.classList.contains("ql-direction-rtl")) {
                        (element as HTMLElement).style.paddingRight = `${indentValue * INDENT_MAGIC_NUMBER}em`;
                    } else {
                        (element as HTMLElement).style.paddingLeft = `${indentValue * INDENT_MAGIC_NUMBER}em`;
                    }
                }
                element.classList.remove(indentClass);
            }
        });
    }
}
