import { EditableValue, ActionValue } from "mendix";

export interface APIDeps {
    valueAttribute?: EditableValue<Date>;
    startDateAttribute?: EditableValue<Date>;
    endDateAttribute?: EditableValue<Date>;
    onChange?: ActionValue;
}

export interface DepsBox {
    current: APIDeps;
}

export class SyncChannel {
    #deps: DepsBox;

    constructor(deps: DepsBox) {
        this.#deps = deps;
    }

    push = (value: null | Date | [Date | null, Date | null]): void => {
        const deps = this.#deps.current;
        const isRange = Array.isArray(value);
        const single = isRange ? undefined : value;
        const [start, end] = isRange ? value : [];

        deps.valueAttribute?.setValue(single ?? undefined);
        deps.startDateAttribute?.setValue(start ?? undefined);
        deps.endDateAttribute?.setValue(end ?? undefined);

        if (deps.onChange?.canExecute) {
            deps.onChange?.execute();
        }
    };
}
