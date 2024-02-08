import { createElement, useState } from "react";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import { RichTextContainerProps } from "../../typings/RichTextProps";
import loadingCircleSvg from "../ui/loading-circle.svg";
import classNames from "classnames";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { Editor } from "./Editor";

export function RichText(props: RichTextContainerProps): JSX.Element | null {
    const { width: w, height: h, widthUnit, heightUnit, readOnlyStyle, id, stringAttribute } = props;
    const [element, setElement] = useState<HTMLElement | null>(null);

    if (stringAttribute.status !== "available") {
        return <img src={loadingCircleSvg} className="widget-rich-text-loading-spinner" alt="" aria-hidden />;
    }

    const { width, height } = getDimensions({
        width: w,
        widthUnit,
        height: h,
        heightUnit
    });

    const readOnly = stringAttribute.readOnly;

    return (
        <div
            id={id}
            className={classNames("widget-rich-text", `${readOnly ? `editor-${readOnlyStyle}` : ""}`)}
            style={{ width, height }}
        >
            <div ref={setElement} />
            {element ? <Editor element={element} widgetProps={props} /> : null}
            <ValidationAlert>{stringAttribute.validation}</ValidationAlert>
        </div>
    );
}
