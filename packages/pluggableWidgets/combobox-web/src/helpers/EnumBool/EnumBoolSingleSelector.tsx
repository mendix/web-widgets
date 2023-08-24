import { EditableValue, ActionValue } from "mendix";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { SingleSelector, Status } from "../types";
import { extractEnumerationProps } from "./utils";
import { EnumAndBooleanSimpleCaptionsProvider } from "./EnumAndBooleanSimpleCaptionsProvider";
import { EnumBoolOptionsProvider } from "./EnumBoolOptionsProvider";
import { executeAction } from "@mendix/pluggable-widgets-commons";

export class EnumBooleanSingleSelector implements SingleSelector {
    status: Status = "unavailable";
    type = "single" as const;
    private isBoolean = false;
    private _attr: EditableValue<string | boolean> | undefined;
    private onChangeEvent?: ActionValue;

    currentValue: string | null = null;
    caption: EnumAndBooleanSimpleCaptionsProvider;
    options: EnumBoolOptionsProvider<string | boolean>;
    clearable = true;
    readOnly = false;

    constructor() {
        this.caption = new EnumAndBooleanSimpleCaptionsProvider();
        this.options = new EnumBoolOptionsProvider(this.caption);
    }

    updateProps(props: ComboboxContainerProps): void {
        const [attr, emptyOption, clearable, filterType] = extractEnumerationProps(props);
        this._attr = attr;

        this.caption.updateProps({
            attribute: attr,
            emptyOptionText: emptyOption
        });

        this.options._updateProps({
            attribute: attr,
            filterType
        });

        if (!attr || attr.status === "unavailable" || !emptyOption || emptyOption.status === "unavailable") {
            this.status = "unavailable";
            this.currentValue = null;
            this.clearable = true;

            return;
        }

        this.onChangeEvent = props.onChangeEvent;
        this.status = attr.status;
        this.isBoolean = typeof attr.universe?.[0] === "boolean";
        this.clearable = this.isBoolean ? false : clearable;
        this.currentValue = attr.value?.toString() ?? null;
        this.readOnly = attr.readOnly;
    }

    setValue(value: string | null): void {
        this._attr?.setValue(this.options._optionToValue(value));
        executeAction(this.onChangeEvent);
    }
}
