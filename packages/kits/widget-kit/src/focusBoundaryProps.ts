import { FocusEvent } from "react";

/** What the helper needs from a view model: the two commands of the input facet. */
export interface FocusBoundaryTarget {
    enter(): void;
    leave(): void;
}

export interface FocusBoundaryProps {
    onFocus(e: FocusEvent<HTMLElement>): void;
    onBlur(e: FocusEvent<HTMLElement>): void;
}

function crossesBoundary(e: FocusEvent<HTMLElement>): boolean {
    return !e.currentTarget.contains(e.relatedTarget as Node | null);
}

/**
 * The focus boundary of a widget: `enter` when focus comes from outside the element, `leave` when
 * it goes outside, nothing while it moves between the element's descendants. A View spreads the
 * result on whichever element it considers its root; no element is imposed.
 * See docs/design/headless-widgets.md, section 8.5.
 */
export function focusBoundaryProps(vm: FocusBoundaryTarget): FocusBoundaryProps {
    return {
        onFocus: e => {
            if (crossesBoundary(e)) {
                vm.enter();
            }
        },
        onBlur: e => {
            if (crossesBoundary(e)) {
                vm.leave();
            }
        }
    };
}
