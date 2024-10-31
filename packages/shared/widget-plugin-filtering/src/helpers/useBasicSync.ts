import { Big } from "big.js";
import { ActionValue, EditableValue } from "mendix";
import { reaction } from "mobx";
import { useEffect, useRef } from "react";
import { InputFilterInterface } from "../typings/InputFilterInterface";

interface Props<T extends string | Big> {
    valueAttribute?: EditableValue<T>;
    onChange?: ActionValue;
}

interface PropBox<T extends string | Big> {
    current: Props<T>;
}

type Pusher<T extends string | Big> = (values: [T, T, T]) => void;

export function useBasicSync<T extends string | Big>(props: Props<T>, store: InputFilterInterface): void {
    const pbox: PropBox<T> = useRef(props);

    useEffect(() => {
        pbox.current = props;
    });

    useEffect(() => {
        return reaction(() => [store.arg1.value, store.arg2.value, store.filterFunction], createPusher(pbox));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

function createPusher<T extends string | Big>(pbox: PropBox<T>): Pusher<T> {
    return ([value1, _value2, _value3]) => {
        const props = pbox.current;
        props.valueAttribute?.setValue(value1 ?? undefined);

        if (props.onChange?.canExecute) {
            props.onChange?.execute();
        }
    };
}
