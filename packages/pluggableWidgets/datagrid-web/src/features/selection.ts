import { useMemo } from "react";
import type { ObjectItem } from "mendix";
import { MultiSelectionStatus, SelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { DatagridContainerProps, DatagridPreviewProps, ItemSelectionMethodEnum } from "../../typings/DatagridProps";

export type SelectionMethod = ItemSelectionMethodEnum | "none";

export type onSelectAllReqState = "selectAll" | "deselectAll";

export type onSelect = (item: ObjectItem, shiftKey: boolean) => void;

export type SelectActionProps = {
    onSelect: onSelect;
    onSelectAll: (requestedState?: onSelectAllReqState) => void;
    isSelected: (item: ObjectItem) => boolean;
};

const defaultProps: SelectActionProps = {
    onSelect: () => undefined,
    onSelectAll: () => undefined,
    isSelected: () => false
};

export function useOnSelectProps(selection: SelectionHelper | undefined): SelectActionProps {
    return useMemo(() => {
        if (!selection) {
            return defaultProps;
        }

        return {
            onSelect: (item, shiftKey) => {
                shiftKey = shiftKey ?? false;

                if (selection.type === "Multi" && shiftKey) {
                    selection.selectUpTo(item);
                } else if (selection.isSelected(item)) {
                    selection.remove(item);
                } else {
                    selection.add(item);
                }
            },
            onSelectAll(requestedState) {
                if (selection.type === "Single") {
                    console.warn("Datagrid: calling onSelectAll in single selection mode have no effect");
                    return;
                }

                if (requestedState === "selectAll") {
                    selection.selectAll();
                    return;
                }

                if (selection.selectionStatus === "all") {
                    selection.selectNone();
                } else {
                    selection.selectAll();
                }
            },
            isSelected: item => selection.isSelected(item)
        };
    }, [selection]);
}

export interface SelectionProps {
    itemSelection?: (DatagridContainerProps | DatagridPreviewProps)["itemSelection"];
    itemSelectionMethod: ItemSelectionMethodEnum;
    showSelectAllToggle: boolean;
}

export type SelectionSettings = {
    selectionStatus: MultiSelectionStatus | undefined;
    selectionMethod: SelectionMethod;
    multiselectable: boolean;
    ariaMultiselectable: boolean | undefined;
};

export function selectionSettings(props: SelectionProps, helper: SelectionHelper | undefined): SelectionSettings {
    const { itemSelection, itemSelectionMethod, showSelectAllToggle } = props;
    const isDesignMode = typeof itemSelection === "string";
    const selectionOn = itemSelection !== undefined && itemSelection !== "None";
    const multiselectable = isDesignMode ? itemSelection === "Multi" : itemSelection?.type === "Multi";
    const methodCheckbox = itemSelectionMethod === "checkbox";
    const selectAllOn = multiselectable && methodCheckbox && showSelectAllToggle;
    const status = isDesignMode ? "none" : helper?.type === "Multi" ? helper.selectionStatus : undefined;

    return {
        selectionStatus: selectAllOn ? status : undefined,
        selectionMethod: selectionOn ? itemSelectionMethod : "none",
        multiselectable,
        ariaMultiselectable: selectionOn ? multiselectable : undefined
    };
}
