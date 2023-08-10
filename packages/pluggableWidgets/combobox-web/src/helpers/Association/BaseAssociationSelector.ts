import { ObjectItem, ReferenceValue, ReferenceSetValue, ActionValue } from "mendix";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { Status } from "../types";
import { AssociationOptionsProvider } from "./AssociationOptionsProvider";
import { AssociationSimpleCaptionsProvider } from "./AssociationSimpleCaptionsProvider";
import { extractAssociationProps } from "./utils";
import { executeAction } from "@mendix/pluggable-widgets-commons";

export class BaseAssociationSelector<T extends string | string[], R extends ReferenceSetValue | ReferenceValue> {
    status: Status = "unavailable";
    options: AssociationOptionsProvider;
    clearable = false;
    currentValue: T | null = null;
    caption: AssociationSimpleCaptionsProvider;
    readOnly = false;
    protected _attr: R | undefined;

    private _valuesMap: Map<string, ObjectItem> = new Map();
    private onChangeEvent?: ActionValue;

    constructor() {
        this.caption = new AssociationSimpleCaptionsProvider(this._valuesMap);
        this.options = new AssociationOptionsProvider(this.caption, this._valuesMap);
    }

    updateProps(props: ComboboxContainerProps): void {
        const [attr, ds, captionProvider, emptyOption, clearable, filterType, onChangeEvent] =
            extractAssociationProps(props);
        this._attr = attr as R;
        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider
        });

        this.options._updateProps({
            attr,
            ds,
            filterType
        });

        if (
            !attr ||
            attr.status === "unavailable" ||
            !ds ||
            ds.status === "unavailable" ||
            !captionProvider ||
            !emptyOption ||
            emptyOption.status === "unavailable"
        ) {
            this.status = "unavailable";
            this.currentValue = null;
            this.clearable = false;

            return;
        }
        this.clearable = clearable;
        this.status = attr.status;
        this.readOnly = attr.readOnly;
        this.onChangeEvent = onChangeEvent;
    }

    setValue(_value: T | null): void {
        executeAction(this.onChangeEvent);
    }
}
