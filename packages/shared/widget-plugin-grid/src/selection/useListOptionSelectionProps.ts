import { useMemo } from "react";
import { SelectionHelper } from "./helpers";
import { SelectionType, WidgetSelectionProperty } from "./types";
import { PrimarySelectionProps, usePrimarySelectionProps } from "./usePrimarySelectionProps";
import { useKeyboardHandlers, KeyboardTargetProps } from "./useKeyboardHandlers";
import { getSelectionType } from "./utils";

export type ListOptionSelectionProps = PrimarySelectionProps & KeyboardTargetProps & { selectionType: SelectionType };

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
            selectionType,
            ...primaryProps,
            ...keyboard
        };
    }

    return useMemo(computeProps, [selectionType, primaryProps, keyboard]);
}
