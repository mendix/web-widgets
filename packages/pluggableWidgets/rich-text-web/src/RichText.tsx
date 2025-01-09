import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import classNames from "classnames";
import { createElement, Fragment, useEffect, useState } from "react";
import { RichTextContainerProps } from "../typings/RichTextProps";
import EditorWrapper from "./components/EditorWrapper";
import "./ui/RichText.scss";
import { constructWrapperStyle } from "./utils/helpers";

export default function RichText(props: RichTextContainerProps): JSX.Element {
    const { stringAttribute, readOnlyStyle } = props;

    const wrapperStyle = constructWrapperStyle(props);
    const [isIncubator, setIsIncubator] = useState(true);

    useEffect(() => {
        // this is a fix for dojo runtime rendering
        // in dojo runtime, DOM is rendered inside <div class="mx-incubator mx-offscreen"> at the inital stage
        // and moved to content once it fully loads, which cause rich text editor looses reference to it's iframe
        // this fix waits for it to be fully out of incubator div, then only fully renders rich text afterwards.
        const observedIncubator = document.querySelector(`.mx-incubator.mx-offscreen`);
        const observer = new MutationObserver((_mutationList, _observer) => {
            if (!observedIncubator?.childElementCount || observedIncubator?.childElementCount <= 0) {
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
            {stringAttribute.status === "loading" || isIncubator ? (
                <div className="mx-progress"></div>
            ) : (
                <EditorWrapper
                    {...props}
                    style={wrapperStyle}
                    className={classNames(
                        "widget-rich-text",
                        stringAttribute.readOnly && readOnlyStyle === "readPanel"
                            ? "form-control-static"
                            : "form-control",
                        stringAttribute.readOnly ? `widget-rich-text-readonly-${readOnlyStyle}` : ""
                    )}
                    enableStatusBar={props.enableStatusBar && !stringAttribute.readOnly}
                />
            )}
            <ValidationAlert>{stringAttribute.validation}</ValidationAlert>
        </Fragment>
    );
}
