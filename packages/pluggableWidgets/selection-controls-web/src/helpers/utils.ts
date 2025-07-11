import { Big } from "big.js";
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

export function _valuesIsEqual(
    value1: string | Big | boolean | Date | undefined,
    value2: string | Big | boolean | Date | undefined
): boolean {
    if (value1 === value2) {
        return true;
    }

    if (value1 instanceof Big && value2 instanceof Big) {
        return value1.eq(value2);
    }

    if (value1 instanceof Date && value2 instanceof Date) {
        return value1.getTime() === value2.getTime();
    }

    return false;
}
