import { EditableValue } from "mendix";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { _valuesIsEqual } from "../utils";
import { BaseDatabaseSingleSelector } from "./BaseDatabaseSingleSelector";
import { DatabaseValuesProvider } from "./DatabaseValuesProvider";
import { extractDatabaseProps } from "./utils";

export class DatabaseSingleSelectionSelector<
    T extends string | Big,
    R extends EditableValue<T>
> extends BaseDatabaseSingleSelector<T> {
    validation?: string = undefined;
    values: DatabaseValuesProvider;
    protected _attr: R | undefined;

    constructor() {
        super();
        this.values = new DatabaseValuesProvider(this._objectsMap);
    }

    updateProps(props: ComboboxContainerProps): void {
        super.updateProps(props);

        const {
            targetAttribute,
            captionProvider,
            customContent,
            customContentType,
            ds,
            emptyOption,
            emptyValue,
            lazyLoading,
            valueSourceAttribute
        } = extractDatabaseProps(props);

        this.lazyLoader.setLimit(
            this.lazyLoader.getLimit(
                ds.limit,
                targetAttribute?.readOnly ?? false,
                targetAttribute?.status ?? ds.status,
                lazyLoading
            )
        );

        this._attr = targetAttribute as R;
        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider,
            customContent,
            customContentType,
            attribute: valueSourceAttribute,
            caption: targetAttribute?.displayValue
        });

        this.values.updateProps({
            valueAttribute: valueSourceAttribute,
            emptyValue
        });

        if (!ds || ds.status === "unavailable" || !emptyOption || emptyOption.status === "unavailable") {
            this.status = "unavailable";
            this.currentId = null;
            this.clearable = false;
            return;
        }

        if (targetAttribute?.status === "available") {
            if (this.lastSetValue === null || !_valuesIsEqual(this.lastSetValue, targetAttribute.value)) {
                if (ds.status === "available") {
                    this.lastSetValue = this._attr.value;
                    if (!_valuesIsEqual(this.values.getEmptyValue(), targetAttribute.value)) {
                        const obj = this.options.getAll().find(option => {
                            return _valuesIsEqual(targetAttribute.value, this.values.get(option));
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

        this.readOnly = targetAttribute?.readOnly ?? false;
        this.status = targetAttribute?.status ?? ds.status;
        this.validation = targetAttribute?.validation;
    }

    setValue(objectId: string | null): void {
        const value = this.values.get(objectId) as T;
        this.lastSetValue = value;
        this._attr?.setValue(value);
        super.setValue(objectId);
    }
}
