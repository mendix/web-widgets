import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import classNames from "classnames";
import { createElement, Fragment, useState, useEffect } from "react";
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
        readOnlyStyle,
        enableStatusBar,
        resize
    } = props;

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
    const [isIncubator, setIsIncubator] = useState(true);

    useEffect(() => {
        // this is a fix for dojo runtime rendering
        // in dojo runtime, DOM is rendered inside <div class="mx-incubator mx-offscreen"> at the inital stage
        // and moved to content once it fully loads, which cause rich text editor looses reference to it's iframe
        // this fix waits for it to be fully out of incubator div, then only fully renders rich text afterwards.
        const observer = new MutationObserver(_mutationList => {
            if (!document.querySelector(`.mx-incubator.mx-offscreen`)?.childElementCount) {
                setIsIncubator(false);
            }
        });
        const observedIncubator = document.querySelector(`.mx-incubator.mx-offscreen`);
        if (observedIncubator && observedIncubator.childElementCount) {
            observer.observe(observedIncubator, {
                childList: true
            });
        } else {
            setIsIncubator(false);
        }

        return () => {
            observer.disconnect();
        };
    }, []);
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
                {stringAttribute.status === "loading" || stringAttribute.status !== "available" || isIncubator ? (
                    <div className="mx-progress"></div>
                ) : (
                    <BundledEditor
                        {...props}
                        menubar={menubar}
                        toolbar={presets.toolbar}
                        editorHeight={height}
                        editorWidth={width}
                        key={`${String(stringAttribute.readOnly)}_${id}_${props.content_css?.value}`}
                        resize={enableStatusBar ? resize : "false"}
                    />
                )}
            </div>
            <ValidationAlert>{stringAttribute.validation}</ValidationAlert>
        </Fragment>
    );
}
