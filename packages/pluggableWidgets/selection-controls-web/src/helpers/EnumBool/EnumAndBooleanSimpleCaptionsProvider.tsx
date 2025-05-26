import { DynamicValue, EditableValue } from "mendix";
import { ReactNode, createElement } from "react";
import { CaptionsProvider } from "../types";

interface EnumAndBooleanSimpleCaptionsProviderProps {
    emptyOptionText?: DynamicValue<string>;
    attribute: EditableValue<string | boolean>;
}

export class EnumAndBooleanSimpleCaptionsProvider implements CaptionsProvider {
    private attr?: EditableValue<string | boolean>;
    emptyCaption = "";
    updateProps(props: EnumAndBooleanSimpleCaptionsProviderProps): void {
        this.attr = props.attribute;
        if (!props.emptyOptionText || props.emptyOptionText.status === "unavailable") {
            this.emptyCaption = "";
        } else {
            this.emptyCaption = props.emptyOptionText.value!;
        }
    }

    get(value: string | boolean | null): string {
        if (value === null) {
            return this.emptyCaption;
        }

        return this.attr?.formatter.format(value) ?? "";
    }

    render(value: string | null): ReactNode {
        return <span className="widget-combobox-caption-text">{this.get(value)}</span>;
    }
}
