import { useMemo } from "react";
import { SelectionHelper } from "./helpers";
import { SelectionType, WidgetSelectionProperty } from "./types";
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
    KeyboardTargetProps & { selectionType: SelectionType };

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
            selectionType,
            selectionMethod,
            showSelectAllToggle,
            showCheckboxColumn,
            ...primaryProps,
            ...keyboard
        };
    }

    return useMemo(computeProps, [
        selectionType,
        selectionMethod,
        showSelectAllToggle,
        showCheckboxColumn,
        primaryProps,
        keyboard
    ]);
}
