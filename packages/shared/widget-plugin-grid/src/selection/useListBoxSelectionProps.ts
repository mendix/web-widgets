import { useMemo } from "react";
import { SelectionHelper } from "./helpers";
import { MultiProps, NoneProps, SelectionType, SingleProps, WidgetSelectionProperty } from "./types";
import { PrimarySelectionProps, usePrimarySelectionProps } from "./usePrimarySelectionProps";
import { useKeyboardHandlers, KeyboardTargetProps } from "./useKeyboardHandlers";
import { getSelectionType } from "./utils";

type ListBoxSelectionProps = PrimarySelectionProps & KeyboardTargetProps & (NoneProps | SingleProps | MultiProps);

type HookParams = {
    selection: WidgetSelectionProperty;
    helper: SelectionHelper;
};

export function useListBoxSelectionProps({ selection, helper }: HookParams): ListBoxSelectionProps {
    const selectionType = getSelectionType(selection);
    const primaryProps = usePrimarySelectionProps(helper);
    const keyboard = useKeyboardHandlers(selectionType, primaryProps);

    function computeProps(): ListBoxSelectionProps {
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
