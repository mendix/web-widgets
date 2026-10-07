import { CSSProperties } from "react";

export type StyleDataFormat = "inline" | "class";

export interface SizeProps {
    style?: CSSProperties;
    "data-width"?: string;
    "data-height"?: string;
}

/**
 * Props that give a node view box its size. Inline format writes the size as
 * inline style. Class format carries it in `data-width`/`data-height` instead,
 * which the stylesheet applies through typed `attr()` (see RichText.scss); a
 * missing or `auto` dimension emits no attribute, leaving the box unsized.
 */
export function sizeProps(format: StyleDataFormat, width?: string, height?: string): SizeProps {
    if (format === "inline") {
        return { style: { width, height } };
    }

    const props: SizeProps = {};
    if (width && width !== "auto") {
        props["data-width"] = width;
    }
    if (height && height !== "auto") {
        props["data-height"] = height;
    }
    return props;
}
