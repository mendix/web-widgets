import { ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { computed } from "mobx";
import { ReactNode } from "react";

/**
 * Selects 'empty placeholder' widgets from gate.
 * @injectable
 */
export function emptyStateWidgetsAtom(
    gate: DerivedPropsGate<{ emptyPlaceholder?: ReactNode }>,
    itemsCount: ComputedAtom<number>
): ComputedAtom<ReactNode> {
    return computed(() => {
        const { emptyPlaceholder } = gate.props;
        if (emptyPlaceholder && itemsCount.get() === 0) {
            return emptyPlaceholder;
        }
        return null;
    });
}
