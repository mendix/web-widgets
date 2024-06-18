import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import classNames from "classnames";
import { createElement, Fragment, useState, useEffect } from "react";
import { RichTextContainerProps } from "../typings/RichTextProps";
import EditorWrapper from "./components/EditorWrapper";
import "./ui/RichText.scss";
import { constructWrapperStyle } from "./utils/helpers";
// import { createMenubar } from "./utils/menubar";
// import { createPreset } from "./utils/presets";

export default function RichText(props: RichTextContainerProps): JSX.Element {
    const {
        stringAttribute,
        id,
        width: w,
        height: h,
        widthUnit,
        heightUnit,
        // preset,
        // menubarMode,
        readOnlyStyle
        // enableStatusBar,
        // resize
    } = props;

    const { width, height } = getDimensions({
        width: w,
        widthUnit,
        height: h,
        heightUnit
    });
    const wrapperAttributes = stringAttribute?.readOnly && readOnlyStyle !== "readPanel" ? { readOnly: true } : {};

    // const presets = createPreset(preset, props);
    // const menubar = createMenubar(menubarMode, props);
    const wrapperStyle = constructWrapperStyle(props, { width, height });
    const [isIncubator, setIsIncubator] = useState(true);

    useEffect(() => {
        // this is a fix for dojo runtime rendering
        // in dojo runtime, DOM is rendered inside <div class="mx-incubator mx-offscreen"> at the inital stage
        // and moved to content once it fully loads, which cause rich text editor looses reference to it's iframe
        // this fix waits for it to be fully out of incubator div, then only fully renders rich text afterwards.
        const observedIncubator = document.querySelector(`.mx-incubator.mx-offscreen`);
        const observer = new MutationObserver((_mutationList, _observer) => {
            if (!observedIncubator?.childElementCount) {
                setIsIncubator(false);
            }
        });

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
                    "form-control",
                    `${stringAttribute?.readOnly ? `editor-${readOnlyStyle}` : ""}`,
                    {
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
                    <EditorWrapper {...props} />
                )}
            </div>
            <ValidationAlert>{stringAttribute.validation}</ValidationAlert>
        </Fragment>
    );
}
