import { createElement, PropsWithChildren, ReactElement } from "react";
import { MouseEvent } from "react";

export interface CaptionContentProps extends PropsWithChildren {
    htmlFor?: string;
    onClick?: (e: MouseEvent) => void;
}

export function CaptionContent(props: CaptionContentProps): ReactElement {
    const { htmlFor, children, onClick } = props;
    return createElement(htmlFor == null ? "span" : "label", {
        children,
        className: "widget-controls-caption-text",
        htmlFor,
        onClick: onClick
            ? onClick
            : htmlFor
              ? (e: MouseEvent) => {
                    e.preventDefault();
                }
              : undefined
    });
}
