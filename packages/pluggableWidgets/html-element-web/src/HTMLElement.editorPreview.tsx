import { ReactElement, createElement, Fragment } from "react";
import { HTMLElementPreviewProps } from "../typings/HTMLElementProps";
import { HTMLTag } from "./components/HTMLTag";
import { prepareTag } from "./utils/props-utils";

export function preview(props: HTMLElementPreviewProps): ReactElement {
    const tag = prepareTag(props.tagName, props.tagNameCustom);

    const items = props.tagUseRepeat ? [1, 2, 3] : [1];

    return (
        <Fragment>
            {items.map(i => (
                <HTMLTag
                    key={i}
                    tagName={tag}
                    attributes={{
                        className: props.className,
                        style: props.styleObject
                    }}
                >
                    {props.tagContentRepeatHTML}
                    {props.tagContentHTML}
                    <props.tagContentRepeatContainer.renderer>
                        <div />
                    </props.tagContentRepeatContainer.renderer>
                    <props.tagContentContainer.renderer>
                        <div />
                    </props.tagContentContainer.renderer>
                </HTMLTag>
            ))}
        </Fragment>
    );
}

export function getPreviewCss(): string {
    // html element has no styling by design
    return "";
}
