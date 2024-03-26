import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import classNames from "classnames";
import { createElement, Fragment } from "react";
import { RichTextContainerProps } from "../typings/RichTextProps";
import BundledEditor from "./components/Editor";
import "./ui/RichText.scss";
import { constructWrapperStyle } from "./utils/helpers";
import { createMenubar } from "./utils/menubar";
import { createPreset } from "./utils/presets";

export default function RichText(props: RichTextContainerProps): JSX.Element {
    const {
        stringAttribute,
        id,
        width: w,
        height: h,
        widthUnit,
        heightUnit,
        preset,
        menubarMode,
        readOnlyStyle
    } = props;

    if (stringAttribute.status === "loading") {
        return <div></div>;
    }

    const { width, height } = getDimensions({
        width: w,
        widthUnit,
        height: h,
        heightUnit
    });
    const wrapperAttributes = stringAttribute?.readOnly && readOnlyStyle !== "readPanel" ? { readOnly: true } : {};

    const presets = createPreset(preset, props);
    const menubar = createMenubar(menubarMode, props);
    const wrapperStyle = constructWrapperStyle(props, { width, height });
    return (
        <Fragment>
            <div
                id={id}
                className={classNames(
                    "widget-rich-text",
                    `${stringAttribute?.readOnly ? `editor-${readOnlyStyle}` : ""}`,
                    {
                        "form-control": props.toolbarLocation === "inline",
                        "widget-rich-text-min-height": heightUnit !== "pixels" && !stringAttribute?.readOnly,
                        "widget-rich-text-min-height-readonly": heightUnit !== "pixels" && stringAttribute?.readOnly
                    }
                )}
                style={wrapperStyle}
                {...wrapperAttributes}
            >
                <BundledEditor
                    {...props}
                    menubar={menubar}
                    toolbar={presets.toolbar}
                    editorHeight={height}
                    key={`${String(stringAttribute.readOnly)}_${id}`}
                />
            </div>
            <ValidationAlert>{stringAttribute.validation}</ValidationAlert>
        </Fragment>
    );
}
