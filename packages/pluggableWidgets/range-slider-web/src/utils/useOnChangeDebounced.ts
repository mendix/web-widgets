import { Big } from "big.js";
import { ActionValue, EditableValue } from "mendix";
import { useMemo } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";

type ChangeHandler = (value: [number, number]) => void;

type UseOnChangeDebounceHook = (params: {
    lowerBoundAttribute: EditableValue<Big>;
    upperBoundAttribute: EditableValue<Big>;
    onChange?: ActionValue;
}) => {
    onChange: ChangeHandler;
};

export const useOnChangeDebounced: UseOnChangeDebounceHook = function useOnChangeDebounced({
    lowerBoundAttribute,
    upperBoundAttribute,
    onChange
}) {
    const [onChangeEnd] = useMemo(() => debounce(() => executeAction(onChange), 500), [onChange]);

    return {
        onChange: ([lower, upper]: [number, number]) => {
            lowerBoundAttribute.setValue(new Big(lower));
            upperBoundAttribute.setValue(new Big(upper));
            onChangeEnd();
        }
    };
};
