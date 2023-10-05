import { useMemo } from "react";
import type { ObjectItem } from "mendix";
import { SelectionHelper } from "./helpers";

export type onSelect = (item: ObjectItem, shiftKey: boolean) => void;

export type onSelectAll = (requestedState?: "selectAll" | "deselectAll") => void;

export type isSelected = (item: ObjectItem) => boolean;

export type PrimarySelectionProps = {
    onSelect: onSelect;
    onSelectAll: onSelectAll;
    isSelected: isSelected;
};

const defaultProps: PrimarySelectionProps = {
    onSelect: () => undefined,
    onSelectAll: () => undefined,
    isSelected: () => false
};

export function usePrimarySelectionProps(selectionHelper: SelectionHelper | undefined): PrimarySelectionProps {
    return useMemo(() => {
        if (selectionHelper === undefined) {
            return defaultProps;
        }

        return {
            onSelect: (item, shiftKey) => {
                if (selectionHelper.type === "Multi" && shiftKey) {
                    selectionHelper.selectUpTo(item);
                } else if (selectionHelper.isSelected(item)) {
                    selectionHelper.remove(item);
                } else {
                    selectionHelper.add(item);
                }
            },
            onSelectAll(requestedState) {
                if (selectionHelper.type === "Single") {
                    console.warn("Datagrid: calling onSelectAll in single selection mode have no effect");
                    return;
                }

                if (requestedState === "selectAll") {
                    selectionHelper.selectAll();
                    return;
                }

                if (selectionHelper.selectionStatus === "all") {
                    selectionHelper.selectNone();
                } else {
                    selectionHelper.selectAll();
                }
            },
            isSelected: item => selectionHelper.isSelected(item)
        };
    }, [selectionHelper]);
}
