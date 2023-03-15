import { useMemo } from "react";
import type { ObjectItem } from "mendix";
import { MultiSelectionStatus, SelectionHelper } from "@mendix/pluggable-widgets-commons";
import { DatagridContainerProps, DatagridPreviewProps, ItemSelectionMethodEnum } from "typings/DatagridProps";

export type SelectionMethod = ItemSelectionMethodEnum | "none";

export type SelectActionProps = {
    onSelect: (item: ObjectItem) => void;
    onSelectAll: () => void;
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
            onSelect: item => {
                if (selection.isSelected(item)) {
                    selection.remove(item);
                } else {
                    selection.add(item);
                }
            },
            onSelectAll:
                selection.type === "Single"
                    ? () => {
                          console.warn("Datagrid: calling onSelectAll in single selection mode have no effect");
                      }
                    : () => {
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

type SelectionSettings = {
    selectionStatus: MultiSelectionStatus | undefined;
    selectionMethod: SelectionMethod;
};

export function selectionSettings(props: SelectionProps, helper: SelectionHelper | undefined): SelectionSettings {
    const { itemSelection, itemSelectionMethod, showSelectAllToggle } = props;
    const isDesignMode = typeof itemSelection === "string";
    const selectionOn = itemSelection !== undefined && itemSelection !== "None";
    const selectionMulti = isDesignMode ? itemSelection === "Multi" : itemSelection?.type === "Multi";
    const methodCheckbox = itemSelectionMethod === "checkbox";
    const selectAllOn = selectionMulti && methodCheckbox && showSelectAllToggle;
    const status = isDesignMode ? "none" : helper?.type === "Multi" ? helper.selectionStatus : undefined;

    return {
        selectionStatus: selectAllOn ? status : undefined,
        selectionMethod: selectionOn ? itemSelectionMethod : "none"
    };
}
