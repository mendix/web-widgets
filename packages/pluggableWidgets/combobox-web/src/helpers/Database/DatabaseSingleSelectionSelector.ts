import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ActionValue, EditableValue, ObjectItem, SelectionSingleValue, ValueStatus } from "mendix";
import { ComboboxContainerProps, OptionsSourceAssociationCustomContentTypeEnum } from "../../../typings/ComboboxProps";
import { SingleSelector, Status } from "../types";
import { DEFAULT_LIMIT_SIZE } from "../utils";
import { DatabaseCaptionsProvider } from "./DatabaseCaptionsProvider";
import { DatabaseOptionsProvider } from "./DatabaseOptionsProvider";
import { extractDatabaseProps } from "./utils";

export class DatabaseSingleSelectionSelector<T extends string | Big, R extends EditableValue<T>>
    implements SingleSelector
{
    type = "single" as const;
    status: Status = "unavailable";
    options: DatabaseOptionsProvider;
    clearable = false;
    currentId: string | null = null;
    lastSetValue: T | null | undefined = null;
    caption: DatabaseCaptionsProvider;
    readOnly = false;
    lazyLoading = false;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    validation?: string = undefined;
    selection?: SelectionSingleValue;
    protected _attr: R | undefined;
    private onChangeEvent?: ActionValue;
    private _objectsMap: Map<string, ObjectItem> = new Map();
    private limit: number = DEFAULT_LIMIT_SIZE;

    constructor() {
        this.caption = new DatabaseCaptionsProvider(this._objectsMap);
        this.options = new DatabaseOptionsProvider(this.caption, this._objectsMap);
    }

    updateProps(props: ComboboxContainerProps): void {
        const [
            _attr,
            ds,
            captionProvider,
            emptyOption,
            clearable,
            filterType,
            onChangeEvent,
            customContent,
            customContentType,
            valueAttribute,
            _emptyValue,
            lazyLoading
        ] = extractDatabaseProps(props);

        const newLimit = this.newLimit(ds.limit, false, ds.status, lazyLoading);
        if (newLimit !== ds.limit) {
            ds.setLimit(newLimit);
        }

        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider,
            customContent,
            customContentType,
            attribute: valueAttribute
        });

        this.options._updateProps({
            ds,
            filterType
        });
        if (!ds || ds.status === "unavailable" || !emptyOption || emptyOption.status === "unavailable") {
            this.status = "unavailable";
            this.currentId = null;
            this.clearable = false;
            return;
        }

        this.clearable = clearable;
        this.status = ds.status;
        // this.readOnly = ;
        this.onChangeEvent = onChangeEvent;
        this.customContentType = customContentType;
        // this.validation = attr.validation;
        this.lazyLoading = lazyLoading;
        this.selection = props.optionsSourceDatabaseItemSelection as SelectionSingleValue;
    }

    setValue(objectId: string | null): void {
        this.selection?.setSelection(this.options._optionToValue(objectId));

        this.currentId = objectId;
        executeAction(this.onChangeEvent);
    }

    private newLimit(limit: number, readOnly: boolean, status: ValueStatus, lazyLoading: boolean): number | undefined {
        if (status !== "available" || readOnly === true) {
            return 0;
        }

        if (lazyLoading) {
            if (limit < this.limit) {
                return this.limit;
            }
            if (limit > this.limit) {
                this.limit = limit;
            }
            return limit;
        }

        return undefined;
    }
}
