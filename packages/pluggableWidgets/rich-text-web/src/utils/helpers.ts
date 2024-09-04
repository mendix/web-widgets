import { CSSProperties } from "react";
import Quill from "quill";
import { Delta, Op } from "quill/core";
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

export function updateLegacyQuillFormats(quill: Quill): boolean {
    const results = transformLegacyQuillFormats(quill.getContents());
    if (results.isDirty) {
        quill.setContents(results.data, Quill.sources.USER);
    }

    return results.isDirty;
}

/**
 * Transform previous version of Quill formats :
 * - previous version us ql-indent-n as classnames for indentation, which is highly dependant on quill's css
 *   this function will transformed it to use inline style
 */
export function transformLegacyQuillFormats(delta: Delta): { data: Op[]; isDirty: boolean } {
    let isDirty = false;
    const newDelta: Op[] = delta.map(d => {
        if (d.attributes && d.attributes.hasOwnProperty("indent")) {
            d.attributes["indent-left"] = (d.attributes.indent as number) * 3;
            delete d.attributes.indent;
            if (!isDirty) {
                isDirty = true;
            }
        }
        return d;
    });
    return { data: newDelta, isDirty: isDirty };
}
