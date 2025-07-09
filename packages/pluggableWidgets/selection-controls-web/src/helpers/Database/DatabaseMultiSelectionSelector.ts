import { ListAttributeValue, ObjectItem, SelectionMultiValue } from "mendix";
import {
    OptionsSourceAssociationCustomContentTypeEnum,
    SelectionControlsContainerProps
} from "../../../typings/SelectionControlsProps";
import { MultiSelector, Status } from "../types";
import { DatabaseCaptionsProvider } from "./DatabaseCaptionsProvider";
import { DatabaseOptionsProvider } from "./DatabaseOptionsProvider";
import { extractDatabaseProps } from "./utils";

export class DatabaseMultiSelectionSelector implements MultiSelector {
    caption: DatabaseCaptionsProvider;
    currentId: string[] | null = null;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    options: DatabaseOptionsProvider;
    readOnly = false;
    selection?: SelectionMultiValue;
    status: Status = "unavailable";
    type = "multi" as const;
    groupName: string;
    private _objectsMap: Map<string, ObjectItem> = new Map();

    constructor() {
        this.caption = new DatabaseCaptionsProvider(this._objectsMap);
        this.options = new DatabaseOptionsProvider(this._objectsMap);
        this.groupName = `multi-selection-${Math.random().toString(36).substring(2, 15)}`;
    }

    getOptions(): string[] {
        return this.options.getAll();
    }

    updateProps(props: SelectionControlsContainerProps): void {
        const {
            captionProvider,
            captionType,
            customContent,
            customContentType,
            ds,
            emptyOption,
            valueSourceAttribute
        } = extractDatabaseProps(props);

        if (
            !ds ||
            ds.status === "unavailable" ||
            !captionProvider ||
            !emptyOption ||
            emptyOption.status === "unavailable"
        ) {
            this.status = "unavailable";
            this.currentId = null;
            return;
        } else {
            this.status = "available";
        }

        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider,
            customContent,
            customContentType,
            attribute: valueSourceAttribute,
            caption: undefined
        });
        this.options._updateProps({
            ds,
            attributeId: captionType === "attribute" ? (captionProvider as ListAttributeValue<string>).id : undefined
        });

        this.customContentType = customContentType;
        this.selection = props.optionsSourceDatabaseItemSelection as SelectionMultiValue;
    }

    setValue(value: string[] | null): void {
        const newValue = value?.map(v => this.options._optionToValue(v)!);
        if (newValue) {
            this.selection?.setSelection(newValue);
        }
    }
}
