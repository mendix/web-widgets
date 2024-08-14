import { EditableValue, SelectionSingleValue } from "mendix";
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
    private selection?: SelectionSingleValue;

    constructor() {
        super();
        this.values = new DatabaseValuesProvider(this._objectsMap);
    }

    updateProps(props: ComboboxContainerProps): void {
        super.updateProps(props);

        const {
            attr,
            captionProvider,
            customContent,
            customContentType,
            ds,
            emptyOption,
            emptyValue,
            lazyLoading,
            valueAttribute
        } = extractDatabaseProps(props);

        this.lazyLoader.setLimit(
            this.lazyLoader.getLimit(ds.limit, attr?.readOnly ?? false, attr?.status ?? ds.status, lazyLoading)
        );

        this._attr = attr as R;
        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider,
            customContent,
            customContentType,
            attribute: valueAttribute,
            caption: attr?.displayValue
        });

        this.values.updateProps({
            valueAttribute,
            emptyValue
        });

        if (!ds || ds.status === "unavailable" || !emptyOption || emptyOption.status === "unavailable") {
            this.status = "unavailable";
            this.currentId = null;
            this.clearable = false;
            return;
        }

        if (attr?.status === "available") {
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

        this.readOnly = attr?.readOnly ?? false;
        this.status = attr?.status ?? ds.status;
        this.validation = attr?.validation;
        this.selection = props.optionsSourceDatabaseItemSelection as SelectionSingleValue;

        if (this.selection.selection === undefined) {
            const objectId = this.options.getAll().find(option => {
                return _valuesIsEqual(attr?.value, this.values.get(option));
            });

            if (objectId) {
                this.selection.setSelection(this.options._optionToValue(objectId));
            }
        }
    }

    setValue(objectId: string | null): void {
        const value = this.values.get(objectId) as T;
        this.lastSetValue = value;
        this._attr?.setValue(value);
        if (objectId !== (this.selection?.selection?.id ?? "")) {
            this.selection?.setSelection(this.options._optionToValue(objectId));
        }
        super.setValue(objectId);
    }
}
