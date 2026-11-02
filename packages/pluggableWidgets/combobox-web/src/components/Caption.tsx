import { createElement, MouseEvent, PropsWithChildren, ReactElement } from "react";
import { useComboboxClasses } from "../hooks/useComboboxClasses";

export interface CaptionProps extends PropsWithChildren {
    /** Renders a `label` for this control instead of a `span`. */
    htmlFor?: string;
    onClick?: (e: MouseEvent) => void;
}

function preventDefault(e: MouseEvent): void {
    e.preventDefault();
}

/** The plain caption of an option, a chip or the input area. */
export function Caption({ htmlFor, children, onClick }: CaptionProps): ReactElement {
    const classes = useComboboxClasses();
    return createElement(htmlFor == null ? "span" : "label", {
        children,
        className: classes.caption,
        htmlFor,
        onClick: onClick ?? (htmlFor ? preventDefault : undefined)
    });
}
