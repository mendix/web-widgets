import { EditableValue, ListAttributeValue, ObjectItem, SelectionSingleValue } from "mendix";
import {
    SelectionControlsContainerProps,
    OptionsSourceAssociationCustomContentTypeEnum
} from "../../../typings/SelectionControlsProps";
import { SingleSelector, Status } from "../types";
import { _valuesIsEqual } from "../utils";
import { DatabaseCaptionsProvider } from "./DatabaseCaptionsProvider";
import { DatabaseOptionsProvider } from "./DatabaseOptionsProvider";
import { DatabaseValuesProvider } from "./DatabaseValuesProvider";
import { extractDatabaseProps, getReadonly } from "./utils";

export class DatabaseSingleSelectionSelector<T extends string | Big, R extends EditableValue<T>>
    implements SingleSelector
{
    caption: DatabaseCaptionsProvider;
    currentId: string | null = null;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    options: DatabaseOptionsProvider;
    readOnly = false;
    status: Status = "unavailable";
    type = "single" as const;
    groupName: string;
    protected _objectsMap: Map<string, ObjectItem> = new Map();

    validation?: string = undefined;
    values: DatabaseValuesProvider;
    protected _attr: R | undefined;
    private selection?: SelectionSingleValue;

    constructor() {
        this.caption = new DatabaseCaptionsProvider(this._objectsMap);
        this.options = new DatabaseOptionsProvider(this._objectsMap);
        this.values = new DatabaseValuesProvider(this._objectsMap);
        this.groupName = `single-selection-${Math.random().toString(36).substring(2, 15)}`;
    }

    updateProps(props: SelectionControlsContainerProps): void {
        const {
            targetAttribute,
            captionProvider,
            captionType,
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
            ds,
            attributeId: captionType === "attribute" ? (captionProvider as ListAttributeValue<string>).id : undefined
        });

        this.values.updateProps({
            valueAttribute: valueSourceAttribute
        });

        if (!ds || ds.status === "unavailable" || !emptyOption || emptyOption.status === "unavailable") {
            this.status = "unavailable";
            this.currentId = null;
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
                    // this.options.loadSelectedValue(targetAttribute.value?.toString());
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
        this.customContentType = customContentType;

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
