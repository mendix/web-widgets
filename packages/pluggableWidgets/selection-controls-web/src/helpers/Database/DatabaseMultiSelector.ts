import { EditableValue, ObjectItem, SelectionMultiValue } from "mendix";
import { Big } from "big.js";
import {
    SelectionControlsContainerProps,
    OptionsSourceCustomContentTypeEnum
} from "../../../typings/SelectionControlsProps";
import { MultiSelector, Status } from "../types";
import { _valuesIsEqual } from "../utils";
import { DatabaseCaptionsProvider } from "./DatabaseCaptionsProvider";
import { DatabaseOptionsProvider } from "./DatabaseOptionsProvider";
import { DatabaseValuesProvider } from "./DatabaseValuesProvider";
import { extractDatabaseProps, getReadonly } from "./utils";

export class DatabaseMultiSelector<T extends string | Big, R extends EditableValue<T>> implements MultiSelector {
    type = "multi" as const;
    attributeType: "string" | "big" | "boolean" | "date" = "string";
    selectorType: "context" | "database" | "static" = "database";
    status: Status = "unavailable";
    options: DatabaseOptionsProvider;
    caption: DatabaseCaptionsProvider;
    clearable = false;
    currentId: string[] | null = null;
    readOnly = false;
    customContentType: OptionsSourceCustomContentTypeEnum = "no";
    validation?: string = undefined;
    values: DatabaseValuesProvider;
    protected _objectsMap: Map<string, ObjectItem> = new Map();
    protected _attr: R | undefined;
    private selection?: SelectionMultiValue;

    constructor() {
        this.caption = new DatabaseCaptionsProvider(this._objectsMap);
        this.options = new DatabaseOptionsProvider(this.caption, this._objectsMap);
        this.values = new DatabaseValuesProvider(this._objectsMap);
    }

    updateProps(props: SelectionControlsContainerProps): void {
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

        // For multi-selection, we need to handle arrays of values
        if (targetAttribute?.status === "available") {
            // In a multi-selector context, targetAttribute.value would typically be an array
            // For now, we'll initialize as empty array
            this.currentId = [];
        }

        this.status = targetAttribute?.status ?? ds.status;
        this.validation = targetAttribute?.validation;
        this.selection = props.optionsSourceDatabaseItemSelection as SelectionMultiValue;

        this.clearable = clearable;
        this.customContentType = customContentType;
    }

    setValue(objectIds: string[] | null): void {
        // For multi-selection, we would need to handle multiple values
        // This is a simplified implementation
        this.currentId = objectIds;

        if (this.selection) {
            const objects =
                objectIds
                    ?.map(id => this.options._optionToValue(id))
                    .filter((obj): obj is ObjectItem => obj !== undefined) || [];
            this.selection.setSelection(objects);
        }
    }

    getOptions(): string[] {
        return this.options.getAll();
    }
}
