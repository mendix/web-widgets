import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ActionValue, EditableValue, ObjectItem } from "mendix";
import {
    ComboboxContainerProps,
    LoadingTypeEnum,
    OptionsSourceAssociationCustomContentTypeEnum
} from "../../../typings/ComboboxProps";
import { LazyLoadProvider } from "../LazyLoadProvider";
import { SingleSelector, Status } from "../types";
import { _valuesIsEqual } from "../utils";
import { DatabaseCaptionsProvider } from "./DatabaseCaptionsProvider";
import { DatabaseOptionsProvider } from "./DatabaseOptionsProvider";
import { DatabaseValuesProvider } from "./DatabaseValuesProvider";
import { extractDatabaseProps } from "./utils";

export class DatabaseSingleSelector<T extends string | Big, R extends EditableValue<T>> implements SingleSelector {
    type = "single" as const;
    status: Status = "unavailable";
    values: DatabaseValuesProvider;
    options: DatabaseOptionsProvider;
    clearable = false;
    currentId: string | null = null;
    lastSetValue: T | null | undefined = null;
    caption: DatabaseCaptionsProvider;
    readOnly = false;
    lazyLoading = false;
    loadingType?: LoadingTypeEnum;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    validation?: string = undefined;
    protected _attr: R | undefined;
    private onChangeEvent?: ActionValue;
    private _objectsMap: Map<string, ObjectItem> = new Map();
    private lazyLoader: LazyLoadProvider = new LazyLoadProvider();

    constructor() {
        this.caption = new DatabaseCaptionsProvider(this._objectsMap);
        this.options = new DatabaseOptionsProvider(this.caption, this._objectsMap);
        this.values = new DatabaseValuesProvider(this._objectsMap);
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
            valueAttribute,
            emptyValue,
            lazyLoading,
            loadingType
        ] = extractDatabaseProps(props);

        this.lazyLoader.updateProps(ds);
        this.lazyLoader.setLimit(this.lazyLoader.getLimit(ds.limit, attr.readOnly, attr.status, lazyLoading));

        this._attr = attr as R;
        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider,
            customContent,
            customContentType,
            attribute: valueAttribute,
            caption: this._attr.displayValue
        });

        this.options._updateProps({
            ds,
            filterType
        });

        this.values.updateProps({
            valueAttribute,
            emptyValue
        });

        if (
            !attr ||
            attr.status === "unavailable" ||
            !ds ||
            ds.status === "unavailable" ||
            !emptyOption ||
            emptyOption.status === "unavailable"
        ) {
            this.status = "unavailable";
            this.currentId = null;
            this.clearable = false;
            return;
        }

        if (attr.status === "available") {
            if (this.lastSetValue === null || !_valuesIsEqual(this.lastSetValue, attr.value)) {
                if (ds.status === "available") {
                    this.lastSetValue = this._attr.value;
                    if (!_valuesIsEqual(this.values.getEmptyValue(), attr.value)) {
                        const obj = this.options.getAll().find(option => {
                            return _valuesIsEqual(attr.value, this.values.get(option));
                        });
                        if (obj) {
                            this.currentId = obj;
                        } else {
                            this.currentId = null;
                        }
                    }
                }
            }
        }

        this.clearable = clearable;
        this.status = attr.status;
        this.readOnly = attr.readOnly;
        this.onChangeEvent = onChangeEvent;
        this.customContentType = customContentType;
        this.validation = attr.validation;
        this.lazyLoading = lazyLoading;
        this.loadingType = loadingType;
    }

    setValue(objectId: string | null): void {
        const value = this.values.get(objectId) as T;
        this.lastSetValue = value;
        this._attr?.setValue(value);
        this.currentId = objectId;
        executeAction(this.onChangeEvent);
    }
}
