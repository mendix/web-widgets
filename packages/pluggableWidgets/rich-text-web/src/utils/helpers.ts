import { CSSProperties } from "react";
import Quill from "quill";
import { Delta, Op } from "quill/core";
import { RichTextContainerProps } from "typings/RichTextProps";
import DOMPurify, { Config } from "dompurify";

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

export function updateLegacyQuillFormats(quill: Quill): boolean {
    const results = transformLegacyQuillFormats(quill.getContents());
    if (results.isDirty) {
        quill.setContents(new Delta(results.data), Quill.sources.API);
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
        if (d.attributes && d.attributes.indent) {
            if (!d.attributes.list) {
                d.attributes["indent-left"] = (d.attributes.indent as number) * 3;
                delete d.attributes.indent;
            }

            // although there seems no changes here, format.indent have been overriden for getSemanticHTML method
            // thus, this will keep being here instead of inside the upper if.
            if (!isDirty) {
                isDirty = true;
            }
        }
        return d;
    });
    return { data: newDelta, isDirty };
}

type Sanitize = (html: string) => string;

export function parseSanitizationConfig(config?: string): Config {
    try {
        if (!config) {
            return {};
        }
        return JSON.parse(config);
    } catch (e) {
        console.error(e);
        throw new Error(
            'Can not parse "Configuration for HTML sanitization" value. Please check your widget configuration.'
        );
    }
}

export function createSanitize(config?: string): Sanitize {
    const configObject = parseSanitizationConfig(config);
    const purify = DOMPurify(window);
    return html => purify.sanitize(html, { ...configObject, RETURN_DOM_FRAGMENT: false, RETURN_DOM: false });
}

// export function useSanitize(config?: string): ReturnType<typeof createSanitize> {
//     const [sanitize] = useState(() => createSanitize(config));
//     return sanitize;
// }
