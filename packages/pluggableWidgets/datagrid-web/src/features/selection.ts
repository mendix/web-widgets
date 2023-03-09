import { useMemo } from "react";
import type { ObjectItem } from "mendix";
import { MultiSelectionStatus, SelectionHelper } from "@mendix/pluggable-widgets-commons";
import { DatagridContainerProps, DatagridPreviewProps } from "typings/DatagridProps";

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

type SelectionSettings = {
    selectionStatus: MultiSelectionStatus | undefined;
    selectionMethod: SelectionMethod;
};

export function selectionSettings(
    props: DatagridContainerProps | DatagridPreviewProps,
    selection: SelectionHelper
): SelectionSettings {
    const selectionOn = props.itemSelection !== undefined && props.itemSelection !== "None";
    const checkboxOn = props.itemSelectionMethod === "checkbox";
    const status = selectionStatus(props, selection);

    return {
        selectionStatus: props.showSelectAllToggle ? status : undefined,
        selectionMethod: selectionOn
            ? checkboxOn
                ? SelectionMethod.checkbox
                : SelectionMethod.rowClick
            : SelectionMethod.none
    };
}

function selectionStatus(
    props: DatagridContainerProps | DatagridPreviewProps,
    selection: SelectionHelper
): MultiSelectionStatus | undefined {
    // Always "none" in design mode.
    if (props.itemSelection === "Multi") {
        return SelectionMethod.none;
    } else if (selection?.type === "Multi") {
        return selection.selectionStatus;
    }
}

function stub(): (...args: any[]) => void;
function stub<T>(a: T): (...args: any[]) => T;
function stub<T>(a?: T) {
    return (..._args: any[]) => a;
}
