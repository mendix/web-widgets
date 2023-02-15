import { EditableValue } from "mendix";
import { DropdownContainerProps } from "../../../typings/DropdownProps";
import { SingleSelector, Status } from "../types";
import { extractEnumerationProps } from "./utils";
import { EnumAndBooleanSimpleCaptionsProvider } from "./EnumAndBooleanSimpleCaptionsProvider";
import { EnumBoolOptionsProvider } from "./EnumBoolOptionsProvider";

export class EnumBooleanSingleSelector implements SingleSelector {
    status: Status = "unavailable";
    private isBoolean: boolean = false;
    private _attr: EditableValue<string | boolean> | undefined;

    currentValue: string | null = null;
    caption: EnumAndBooleanSimpleCaptionsProvider;
    options: EnumBoolOptionsProvider<string | boolean>;
    clearable: boolean = true;

    constructor() {
        this.caption = new EnumAndBooleanSimpleCaptionsProvider();
        this.options = new EnumBoolOptionsProvider(this.caption);
    }

    updateProps(props: DropdownContainerProps) {
        const [attr, emptyOption, clearable] = extractEnumerationProps(props);
        this._attr = attr;

        this.caption.updateProps({
            attribute: attr,
            emptyOptionText: emptyOption
        });

        this.options._updateProps({
            attribute: attr
        });

        if (!attr || attr.status === "unavailable" || !emptyOption || emptyOption.status === "unavailable") {
            this.status = "unavailable";
            this.currentValue = null;
            this.clearable = true;

            return;
        }

        this.status = attr.status;
        this.isBoolean = typeof attr.universe?.[0] === "boolean";
        this.clearable = this.isBoolean ? false : clearable;
        this.currentValue = attr.value?.toString() ?? null;
    }

    setValue(value: string | null) {
        this._attr?.setValue(this.options._optionToValue(value));
    }
}
