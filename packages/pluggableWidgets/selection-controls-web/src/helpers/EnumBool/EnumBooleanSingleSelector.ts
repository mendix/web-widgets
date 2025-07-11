import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ActionValue, EditableValue } from "mendix";
import {
    SelectionControlsContainerProps,
    OptionsSourceCustomContentTypeEnum
} from "../../../typings/SelectionControlsProps";
import { SingleSelector, Status } from "../types";
import { EnumAndBooleanSimpleCaptionsProvider } from "./EnumAndBooleanSimpleCaptionsProvider";
import { EnumBoolOptionsProvider } from "./EnumBoolOptionsProvider";
import { extractEnumerationProps } from "./utils";

export class EnumBooleanSingleSelector implements SingleSelector {
    status: Status = "unavailable";
    type = "single" as const;
    validation?: string = undefined;
    private isBoolean = false;
    private _attr: EditableValue<string | boolean> | undefined;
    private onChangeEvent?: ActionValue;
    onEnterEvent?: () => void;
    onLeaveEvent?: () => void;

    currentId: string | null = null;
    caption: EnumAndBooleanSimpleCaptionsProvider;
    options: EnumBoolOptionsProvider<string | boolean>;
    customContentType: OptionsSourceCustomContentTypeEnum = "no";
    clearable = true;
    readOnly = false;

    constructor() {
        this.caption = new EnumAndBooleanSimpleCaptionsProvider();
        this.options = new EnumBoolOptionsProvider(this.caption);
    }

    updateProps(props: SelectionControlsContainerProps): void {
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
            this.currentId = null;
            this.clearable = true;

            return;
        }

        this.onChangeEvent = props.onChangeEvent;
        this.onEnterEvent = props.onEnterEvent ? () => executeAction(props.onEnterEvent) : undefined;
        this.onLeaveEvent = props.onLeaveEvent ? () => executeAction(props.onLeaveEvent) : undefined;
        this.status = attr.status;
        this.isBoolean = typeof attr.universe?.[0] === "boolean";
        this.clearable = this.isBoolean ? false : clearable;
        this.currentId = attr.value?.toString() ?? null;
        this.readOnly = attr.readOnly;
        this.validation = attr.validation;
    }

    setValue(value: string | null): void {
        this._attr?.setValue(this.options._optionToValue(value));
        executeAction(this.onChangeEvent);
    }
}
