import { ObjectItem, ReferenceValue, ReferenceSetValue, ActionValue } from "mendix";
import { ComboboxContainerProps, OptionsSourceAssociationCustomContentTypeEnum } from "../../../typings/ComboboxProps";
import { Status } from "../types";
import { AssociationOptionsProvider } from "./AssociationOptionsProvider";
import { AssociationSimpleCaptionsProvider } from "./AssociationSimpleCaptionsProvider";
import { extractAssociationProps } from "./utils";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";

export class BaseAssociationSelector<T extends string | string[], R extends ReferenceSetValue | ReferenceValue> {
    status: Status = "unavailable";
    options: AssociationOptionsProvider;
    clearable = false;
    currentValue: T | null = null;
    caption: AssociationSimpleCaptionsProvider;
    readOnly = false;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    validation?: string = undefined;
    protected _attr: R | undefined;
    private onChangeEvent?: ActionValue;

    private _valuesMap: Map<string, ObjectItem> = new Map();

    constructor() {
        this.caption = new AssociationSimpleCaptionsProvider(this._valuesMap);
        this.options = new AssociationOptionsProvider(this.caption, this._valuesMap);
    }

    updateProps(props: ComboboxContainerProps): void {
        const [
            attr,
            ds,
            captionProvider,
            emptyOption,
            clearable,
            filterType,
            onChangeEvent,
            customContent,
            customContentType
        ] = extractAssociationProps(props);
        this._attr = attr as R;
        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider,
            customContent,
            customContentType
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
        this.customContentType = customContentType;
        this.validation = attr.validation;
    }

    setValue(_value: T | null): void {
        executeAction(this.onChangeEvent);
    }
}
