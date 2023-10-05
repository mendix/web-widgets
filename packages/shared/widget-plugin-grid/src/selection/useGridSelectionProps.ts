import { useMemo } from "react";
import { SelectionHelper } from "./helpers";
import { MultiProps, NoneProps, SelectionType, SingleProps, WidgetSelectionProperty } from "./types";
import { PrimarySelectionProps, usePrimarySelectionProps } from "./usePrimarySelectionProps";
import { useKeyboardHandlers, KeyboardTargetProps } from "./useKeyboardHandlers";
import { getSelectionType } from "./utils";

export type GridSelectionMethod = "checkbox" | "rowClick";

export interface GridSelectionSettings {
    selectionMethod: GridSelectionMethod;
    showCheckboxColumn: boolean;
    showSelectAllToggle: boolean;
}

export type GridSelectionProps = GridSelectionSettings &
    PrimarySelectionProps &
    KeyboardTargetProps &
    (NoneProps | SingleProps | MultiProps);

type HookParams = {
    helper: SelectionHelper | undefined;
    selectionMethod: GridSelectionMethod;
    showSelectAllToggle: boolean;
    selection: WidgetSelectionProperty;
};

export function useGridSelectionProps(params: HookParams): GridSelectionProps {
    const { selectionMethod } = params;
    const selectionType = getSelectionType(params.selection);
    const primaryProps = usePrimarySelectionProps(params.helper);
    const showSelectAllToggle = selectionType === "Multi" && params.showSelectAllToggle;
    const showCheckboxColumn = selectionType !== "None" && selectionMethod === "checkbox";
    const keyboard = useKeyboardHandlers(selectionType, primaryProps);

    function computeProps(): GridSelectionProps {
        return {
            selectionMethod,
            showSelectAllToggle,
            showCheckboxColumn,
            ...primaryProps,
            ...keyboard,
            ...getDependentProps(selectionType)
        };
    }

    return useMemo(computeProps, [
        selectionMethod,
        showSelectAllToggle,
        showCheckboxColumn,
        primaryProps,
        selectionType,
        keyboard
    ]);
}

function getDependentProps(selectionType: SelectionType): NoneProps | SingleProps | MultiProps {
    if (selectionType === "None") {
        return {
            selectionType,
            multiselectable: undefined
        };
    }

    if (selectionType === "Single") {
        return {
            selectionType,
            multiselectable: false
        };
    }

    return {
        selectionType,
        multiselectable: true
    };
}
