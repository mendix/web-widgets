import { EditableValue, ObjectItem, SelectionSingleValue } from "mendix";
import { Big } from "big.js";
import {
    CheckboxRadioSelectionContainerProps,
    OptionsSourceCustomContentTypeEnum
} from "../../../typings/CheckboxRadioSelectionProps";
import { SingleSelector, Status } from "../types";
import { _valuesIsEqual } from "../utils";
import { DatabaseCaptionsProvider } from "./DatabaseCaptionsProvider";
import { DatabaseOptionsProvider } from "./DatabaseOptionsProvider";
import { DatabaseValuesProvider } from "./DatabaseValuesProvider";
import { extractDatabaseProps, getReadonly } from "./utils";

export class DatabaseSingleSelector<T extends string | Big, R extends EditableValue<T>> implements SingleSelector {
    type = "single" as const;
    attributeType: "string" | "big" | "boolean" | "date" = "string";
    selectorType: "context" | "database" | "static" = "database";
    status: Status = "unavailable";
    options: DatabaseOptionsProvider;
    caption: DatabaseCaptionsProvider;
    clearable = false;
    currentId: string | null = null;
    readOnly = false;
    customContentType: OptionsSourceCustomContentTypeEnum = "no";
    validation?: string = undefined;
    values: DatabaseValuesProvider;
    protected _objectsMap: Map<string, ObjectItem> = new Map();
    protected _attr: R | undefined;
    private selection?: SelectionSingleValue;

    constructor() {
        this.caption = new DatabaseCaptionsProvider(this._objectsMap);
        this.options = new DatabaseOptionsProvider(this.caption, this._objectsMap);
        this.values = new DatabaseValuesProvider(this._objectsMap);
    }

    updateProps(props: CheckboxRadioSelectionContainerProps): void {
        const {
            targetAttribute,
            captionProvider,
            clearable,
            customContent,
            customContentType,
            ds,
            emptyOption,
            valueSourceAttribute
        } = extractDatabaseProps(props);

        if (ds.status === "loading") {
            return;
        }

        this._attr = targetAttribute as R;
        this.readOnly = getReadonly(targetAttribute, props.customEditability, props.customEditabilityExpression);

        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider,
            customContent,
            customContentType,
            attribute: valueSourceAttribute,
            caption: targetAttribute?.displayValue
        });

        this.options._updateProps({
            ds
        });

        this.values.updateProps({
            valueAttribute: valueSourceAttribute
        });

        if (!ds || ds.status === "unavailable" || !emptyOption || emptyOption.status !== "available") {
            this.status = "unavailable";
            this.currentId = null;
            this.clearable = false;
            return;
        }

        if (targetAttribute?.status === "available") {
            if (targetAttribute.value && !this.currentId) {
                const allOptions = this.options.getAll();
                const obj = allOptions.find(option => {
                    return _valuesIsEqual(targetAttribute.value, this.values.get(option));
                });
                if (obj) {
                    this.currentId = obj;
                }
            } else if (!targetAttribute.value && this.currentId) {
                this.currentId = null;
                if (this.selection?.selection) {
                    this.selection.setSelection(undefined);
                }
            }
        }

        this.status = targetAttribute?.status ?? ds.status;
        this.validation = targetAttribute?.validation;
        this.selection = props.optionsSourceDatabaseItemSelection as SelectionSingleValue;

        this.clearable = clearable;
        this.customContentType = customContentType;

        if (this.selection && this.selection.selection === undefined) {
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
