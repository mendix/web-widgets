import { Big } from "big.js";
import { useMemo, useEffect } from "react";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ActionValue, EditableValue } from "mendix";

type ChangeHandler = (value: number) => void;

type UseOnChangeDebounceHook = (params: { valueAttribute: EditableValue<Big>; onChange?: ActionValue }) => {
    onChange: ChangeHandler;
};

export const useOnChangeDebounced: UseOnChangeDebounceHook = function useOnChangeDebounced({
    valueAttribute,
    onChange
}) {
    const [onChangeEnd, abort] = useMemo(() => debounce(() => executeAction(onChange), 500), [onChange]);

    useEffect(() => abort, [abort]);

    return {
        onChange: (value: number) => {
            valueAttribute.setValue(new Big(value));
            onChangeEnd();
        }
    };
};
