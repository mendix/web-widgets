import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ActionValue, EditableValue } from "mendix";
import { IReactionDisposer, reaction } from "mobx";

interface Props {
    valueAttribute?: EditableValue<string>;
    onChange?: ActionValue;
}

export class PickerChangeHelper {
    private onChange?: ActionValue;
    private valueAttribute?: EditableValue<string>;
    private valueFn: () => string | undefined;

    constructor(props: Props, valueFn: () => string | undefined) {
        this.onChange = props.onChange;
        this.valueAttribute = props.valueAttribute;
        this.valueFn = valueFn;
    }

    setup(): IReactionDisposer {
        const effect = (value: string | undefined): void => {
            this.valueAttribute?.setValue(value);

            executeAction(this.onChange);
        };

        return reaction(this.valueFn, effect);
    }

    updateProps(props: Props): void {
        this.onChange = props.onChange;
        this.valueAttribute = props.valueAttribute;
    }
}
