import { useMemo } from "react";
import { SelectionHelper } from "./helpers";
import { MultiProps, NoneProps, SelectionType, SingleProps, WidgetSelectionProperty } from "./types";
import { PrimarySelectionProps, usePrimarySelectionProps } from "./usePrimarySelectionProps";
import { useKeyboardHandlers, KeyboardTargetProps } from "./useKeyboardHandlers";
import { getSelectionType } from "./utils";

export type ListOptionSelectionProps = PrimarySelectionProps &
    KeyboardTargetProps &
    (NoneProps | SingleProps | MultiProps);

type HookParams = {
    selection: WidgetSelectionProperty;
    helper: SelectionHelper | undefined;
};

export function useListOptionSelectionProps({ selection, helper }: HookParams): ListOptionSelectionProps {
    const selectionType = getSelectionType(selection);
    const primaryProps = usePrimarySelectionProps(helper);
    const keyboard = useKeyboardHandlers(selectionType, primaryProps);

    function computeProps(): ListOptionSelectionProps {
        return {
            ...primaryProps,
            ...keyboard,
            ...getDependentProps(selectionType)
        };
    }

    return useMemo(computeProps, [selectionType, primaryProps, keyboard]);
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
