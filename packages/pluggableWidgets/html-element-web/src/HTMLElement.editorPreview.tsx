import { ReactElement, createElement, Fragment } from "react";
import { HTMLElementPreviewProps } from "../typings/HTMLElementProps";
import { HTMLTag } from "./components/HTMLTag";
import { isVoidElement, prepareTag } from "./utils/props-utils";

export function preview(props: HTMLElementPreviewProps): ReactElement {
    const tag = prepareTag(props.tagName, props.tagNameCustom);

    const items = props.tagUseRepeat ? [1, 2, 3] : [1];
    const canUseUnsafeHTML = !props.tagUseRepeat && props.tagContentHTML;

    return (
        <Fragment>
            {items.map(i =>
                isVoidElement(tag) ? (
                    <div key={i}>{`<${tag} />`}</div>
                ) : (
                    <HTMLTag
                        key={i}
                        tagName={tag}
                        unsafeHTML={canUseUnsafeHTML ? props.tagContentHTML : undefined}
                        attributes={{
                            className: props.className,
                            style: props.styleObject
                        }}
                    >
                        {props.tagContentRepeatHTML}
                        <props.tagContentRepeatContainer.renderer>
                            <div />
                        </props.tagContentRepeatContainer.renderer>
                        <props.tagContentContainer.renderer>
                            <div />
                        </props.tagContentContainer.renderer>
                    </HTMLTag>
                )
            )}
        </Fragment>
    );
}

export function getPreviewCss(): string {
    // html element has no styling by design
    return "";
}
