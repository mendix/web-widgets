import { useMemo } from "react";
import type { ObjectItem } from "mendix";
import { MultiSelectionStatus, SelectionHelper } from "@mendix/pluggable-widgets-commons";
import { DatagridContainerProps, DatagridPreviewProps, ItemSelectionMethodEnum } from "typings/DatagridProps";

export enum SelectionMethod {
    none = "none",
    rowClick = "rowClick",
    checkbox = "checkbox"
}

export type SelectActionProps<T extends ObjectItem = ObjectItem> = {
    onSelect: (item: T) => void;
    onSelectAll: () => void;
    isSelected: (item: T) => boolean;
};

const defaultProps: SelectActionProps = {
    onSelect: stub(),
    onSelectAll: stub(),
    isSelected: stub(false)
};

export function useOnSelectProps(selection: SelectionHelper): SelectActionProps {
    return useMemo(() => {
        if (!selection) {
            return defaultProps;
        } else {
            return {
                onSelect: item => {
                    if (selection?.isSelected(item)) {
                        selection?.remove(item);
                    } else {
                        selection?.add(item);
                    }
                },
                onSelectAll: () => {
                    if (selection.type !== "Multi") {
                        throw new Error("onSelectAll called when selection is 'Single'");
                    }
                    if (selection.selectionStatus === "all") {
                        selection.selectNone();
                    } else {
                        selection.selectAll();
                    }
                },
                isSelected: item => selection?.isSelected(item) ?? false
            };
        }
    }, [selection]);
}

export interface SelectionProps {
    itemSelection?: (DatagridContainerProps | DatagridPreviewProps)["itemSelection"];
    itemSelectionMethod: ItemSelectionMethodEnum;
    showSelectAllToggle: boolean;
}

type SelectionSettings = {
    selectionStatus: MultiSelectionStatus | undefined;
    selectionMethod: SelectionMethod;
};

export function selectionSettings(props: SelectionProps, helper: SelectionHelper): SelectionSettings {
    const { itemSelection, itemSelectionMethod, showSelectAllToggle } = props;
    const isDesignMode = typeof itemSelection === "string";
    const selectionOn = itemSelection !== undefined && itemSelection !== "None";
    const selectionMulti = isDesignMode ? itemSelection === "Multi" : itemSelection?.type === "Multi";
    const methodCheckbox = itemSelectionMethod === "checkbox";
    const selectAllOn = selectionMulti && methodCheckbox && showSelectAllToggle;
    const status = isDesignMode ? "none" : helper?.type === "Multi" ? helper.selectionStatus : undefined;

    return {
        selectionStatus: selectAllOn ? status : undefined,
        selectionMethod: selectionOn
            ? methodCheckbox
                ? SelectionMethod.checkbox
                : SelectionMethod.rowClick
            : SelectionMethod.none
    };
}

function stub(): (...args: any[]) => void;
function stub<T>(a: T): (...args: any[]) => T;
function stub<T>(a?: T) {
    return (..._args: any[]) => a;
}
