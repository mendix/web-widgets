import { ActionValue, EditableValue } from "mendix";
import { reaction } from "mobx";
import { useEffect, useRef } from "react";
import { FilterFunctionBinary, FilterFunctionGeneric, FilterFunctionNonValue } from "../typings/FilterFunctions";
import { InputFilterInterface } from "../typings/InputFilterInterface";

interface Props {
    valueAttribute?: EditableValue<Date>;
    startDateAttribute?: EditableValue<Date>;
    endDateAttribute?: EditableValue<Date>;
    onChange?: ActionValue;
}

interface PropBox {
    current: Props;
}

type Fn = FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary;

type Pusher<T = Date> = (values: [T | undefined, T | undefined, Fn]) => void;

export function useDateSync(props: Props, store: InputFilterInterface): void {
    const pbox: PropBox = useRef(props);

    useEffect(() => {
        pbox.current = props;
    });

    useEffect(() => {
        return reaction(() => [store.arg1.value, store.arg2.value, store.filterFunction], createPusher(pbox));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

function createPusher(pbox: PropBox): Pusher {
    return ([start, end, filterFn]) => {
        const props = pbox.current;

        if (filterFn === "between") {
            props.startDateAttribute?.setValue(start);
            props.endDateAttribute?.setValue(end);
        } else {
            props.valueAttribute?.setValue(start);
        }

        if (props.onChange?.canExecute) {
            props.onChange?.execute();
        }
    };
}
