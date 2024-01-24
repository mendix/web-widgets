import { ObjectItem, ActionValue, EditableValue } from "mendix";
import { ComboboxContainerProps, OptionsSourceAssociationCustomContentTypeEnum } from "../../../typings/ComboboxProps";
import { SingleSelector, Status } from "../types";
import { DatabaseOptionsProvider } from "./DatabaseOptionsProvider";
import { DatabaseCaptionsProvider } from "./DatabaseCaptionsProvider";
import { extractDatabaseProps } from "./utils";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { DatabaseValuesProvider } from "./DatabaseValuesProvider";

export class DatabaseSingleSelector<T extends string | Big, R extends EditableValue<T>> implements SingleSelector {
    type = "single" as const;
    status: Status = "unavailable";
    values: DatabaseValuesProvider<T>;
    options: DatabaseOptionsProvider;
    clearable = false;
    currentValue: string | null = null;
    caption: DatabaseCaptionsProvider;
    readOnly = false;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    validation?: string = undefined;
    protected _attr: R | undefined;
    private onChangeEvent?: ActionValue;
    private _valuesMap: Map<string, ObjectItem> = new Map();

    constructor() {
        this.caption = new DatabaseCaptionsProvider(this._valuesMap);
        this.options = new DatabaseOptionsProvider(this.caption, this._valuesMap);
        this.values = new DatabaseValuesProvider(this._valuesMap);
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
            customContentType,
            valueExpression
        ] = extractDatabaseProps(props);
        this._attr = attr as R;
        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider,
            customContent,
            customContentType
        });

        this.options._updateProps({
            ds,
            filterType
        });

        this.values.updateProps({
            valueExpression
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

    setValue(_value: string | null): void {
        this._attr?.setValue(this.values.get(_value));
        executeAction(this.onChangeEvent);
    }
}
