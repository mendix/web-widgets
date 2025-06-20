import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ActionValue, EditableValue } from "mendix";
import { IReactionDisposer, reaction } from "mobx";

interface Props {
    valueAttribute?: EditableValue<string>;
    onChange?: ActionValue;
}

export class ValueChangeHelper {
    private readonly gate: DerivedPropsGate<Props>;
    private valueFn: () => string | undefined;

    constructor(gate: DerivedPropsGate<Props>, valueFn: () => string | undefined) {
        this.gate = gate;
        this.valueFn = valueFn;
    }

    setup(): IReactionDisposer {
        const effect = (value: string | undefined): void => {
            const { valueAttribute, onChange } = this.gate.props;
            valueAttribute?.setValue(value);
            executeAction(onChange);
        };

        return reaction(this.valueFn, effect);
    }
}
