import { Big } from "big.js";
import { PropsWithChildren, ReactElement, createElement } from "react";
import { MultiSelector } from "./types";

export const DEFAULT_LIMIT_SIZE = 100;

type ValueType = string | Big | boolean | Date | undefined;

export function getSelectedCaptionsPlaceholder(selector: MultiSelector, selectedItems: string[]): string {
    if (selectedItems.length === 0) {
        return selector.caption.emptyCaption;
    }

    if (selector.customContentType === "yes") {
        return "";
    }

    const selected = selectedItems.map(v => selector.caption.get(v));

    return selected.join(", ");
}

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

export function _valuesIsEqual(valueA: ValueType, valueB: ValueType): boolean {
    if (valueA === undefined || valueB === undefined) {
        return valueA === valueB;
    }
    if (valueA instanceof Big && valueB instanceof Big) {
        return valueA.eq(valueB);
    }
    if (valueA instanceof Date && valueB instanceof Date) {
        return valueA.getTime() === valueB.getTime();
    }
    return valueA === valueB;
}
