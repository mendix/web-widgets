import { EditableValue, ListAttributeValue, ObjectItem, SelectionSingleValue } from "mendix";
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

export class DatabaseSingleSelectionSelector<T extends string | Big, R extends EditableValue<T>>
    implements SingleSelector
{
    caption: DatabaseCaptionsProvider;
    clearable = false;
    currentId: string | null = null;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    lazyLoading = false;
    loadingType?: LoadingTypeEnum;
    options: DatabaseOptionsProvider;
    readOnly = false;
    status: Status = "unavailable";
    type = "single" as const;
    protected _objectsMap: Map<string, ObjectItem> = new Map();
    protected lazyLoader: LazyLoadProvider = new LazyLoadProvider();

    validation?: string = undefined;
    values: DatabaseValuesProvider;
    protected _attr: R | undefined;
    private selection?: SelectionSingleValue;

    constructor() {
        this.caption = new DatabaseCaptionsProvider(this._objectsMap);
        this.options = new DatabaseOptionsProvider(this.caption, this._objectsMap);
        this.values = new DatabaseValuesProvider(this._objectsMap);
    }

    updateProps(props: ComboboxContainerProps): void {
        const {
            targetAttribute,
            captionProvider,
            captionType,
            clearable,
            customContent,
            customContentType,
            ds,
            emptyOption,
            filterType,
            lazyLoading,
            loadingType,
            valueSourceAttribute
        } = extractDatabaseProps(props);

        if (ds.status === "loading") {
            return;
        }
        this._attr = targetAttribute as R;

        this.lazyLoader.updateProps(ds);
        this.lazyLoader.setLimit(
            this.lazyLoader.getLimit(
                ds.limit,
                targetAttribute?.readOnly ?? false,
                targetAttribute?.status ?? ds.status,
                lazyLoading
            )
        );

        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider,
            customContent,
            customContentType,
            attribute: valueSourceAttribute,
            caption: targetAttribute?.displayValue
        });

        this.options._updateProps({
            ds,
            filterType,
            lazyLoading,
            attributeId: captionType === "attribute" ? (captionProvider as ListAttributeValue<string>).id : undefined
        });

        this.values.updateProps({
            valueAttribute: valueSourceAttribute
        });

        if (!ds || ds.status === "unavailable" || !emptyOption || emptyOption.status === "unavailable") {
            this.status = "unavailable";
            this.currentId = null;
            this.clearable = false;
            return;
        }
        if (targetAttribute?.status === "available") {
            if (targetAttribute.value && !this.currentId) {
                const allOptions = this.options.getAll();
                if (allOptions.length > 0) {
                    const obj = this.options.getAll().find(option => {
                        return _valuesIsEqual(targetAttribute.value, this.values.get(option));
                    });
                    if (obj) {
                        this.currentId = obj;
                    }
                } else {
                    this.options.loadSelectedValue(targetAttribute.value?.toString());
                }
            } else if (!targetAttribute.value && this.currentId) {
                this.currentId = null;
            }
        }
        this.readOnly = targetAttribute?.readOnly ?? false;
        this.status = targetAttribute?.status ?? ds.status;
        this.validation = targetAttribute?.validation;
        this.selection = props.optionsSourceDatabaseItemSelection as SelectionSingleValue;

        this.clearable = clearable;
        this.customContentType = customContentType;
        this.lazyLoading = lazyLoading;
        this.loadingType = loadingType;

        if (this.selection.selection === undefined) {
            const objectId = this.options.getAll().find(option => {
                return targetAttribute && _valuesIsEqual(targetAttribute?.value, this.values.get(option));
            });
            if (objectId) {
                this.selection.setSelection(this.options._optionToValue(objectId));
            }
        }
    }

    setValue(objectId: string | null): void {
        const value = this.values.get(objectId) as T;
        this._attr?.setValue(value);
        if (objectId !== (this.selection?.selection?.id ?? "")) {
            this.selection?.setSelection(this.options._optionToValue(objectId));
        }
        this.currentId = objectId;
    }
}
