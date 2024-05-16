import { ThreeStateCheckBoxEnum } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ActionValue, ObjectItem, SelectionMultiValue } from "mendix";
import {
    ComboboxContainerProps,
    OptionsSourceAssociationCustomContentTypeEnum,
    SelectedItemsStyleEnum,
    SelectionMethodEnum
} from "../../../typings/ComboboxProps";
import { MultiSelector, Status } from "../types";
import { DatabaseCaptionsProvider } from "./DatabaseCaptionsProvider";
import { DatabaseOptionsProvider } from "./DatabaseOptionsProvider";
import { extractSelectionDatabaseProps } from "./utils";

export class DatabaseMultiSelectionSelector<T extends string[] | Big[]> implements MultiSelector {
    type = "multi" as const;
    status: Status = "unavailable";
    options: DatabaseOptionsProvider;
    clearable = false;
    lastSetValue: T | null | undefined = null;
    caption: DatabaseCaptionsProvider;
    readOnly = false;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    validation?: string = undefined;
    selection?: SelectionMultiValue;
    selectedItemsStyle: SelectedItemsStyleEnum = "text";
    selectionMethod: SelectionMethodEnum = "checkbox";
    selectAllButton = false;
    private onChangeEvent?: ActionValue;
    private _objectsMap: Map<string, ObjectItem> = new Map();

    constructor() {
        this.caption = new DatabaseCaptionsProvider(this._objectsMap);
        this.options = new DatabaseOptionsProvider(this.caption, this._objectsMap);
    }
    currentId: string[] | null = null;
    onEnterEvent?: (() => void) | undefined;
    onLeaveEvent?: (() => void) | undefined;
    getOptions(): string[] {
        return this.selectionMethod === "rowclick"
            ? this.options.getAll().filter(option => !this.currentId?.includes(option))
            : this.options.getAll();
    }
    isOptionsSelected(): ThreeStateCheckBoxEnum {
        const options = this.options.getAll();
        const unselectedOptions = options.filter(option => !this.currentId?.includes(option));
        if (this.currentId && this.currentId.length > 0) {
            if (unselectedOptions.length === 0) {
                return "all";
            } else {
                return "some";
            }
        } else {
            if (options.length === 0) {
                return "some";
            } else {
                return "none";
            }
        }
    }

    updateProps(props: ComboboxContainerProps): void {
        const [
            ds,
            captionProvider,
            emptyOption,
            clearable,
            filterType,
            onChangeEvent,
            customContent,
            customContentType,
            valueAttribute,
            _emptyValue
        ] = extractSelectionDatabaseProps(props);

        if (
            !ds ||
            ds.status === "unavailable" ||
            !captionProvider ||
            !emptyOption ||
            emptyOption.status === "unavailable"
        ) {
            this.status = "unavailable";
            this.currentId = null;
            this.clearable = false;
            return;
        } else {
            this.status = "available";
        }

        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider,
            customContent,
            customContentType,
            attribute: valueAttribute,
            caption: undefined
        });

        this.options._updateProps({
            ds,
            filterType
        });

        this.selection = props.optionsSourceDatabaseItemSelection as SelectionMultiValue;
        this.currentId = this.selection.selection.map(v => v.id) ?? null;
        this.selectedItemsStyle = props.selectedItemsStyle;
        this.selectionMethod = props.selectionMethod;
        this.selectAllButton = props.selectAllButton;
        if (this.selectionMethod === "rowclick" || this.customContentType === "yes") {
            this.selectedItemsStyle = "boxes";
        }

        this.clearable = clearable;
        this.onChangeEvent = onChangeEvent;
        this.customContentType = customContentType;
    }

    setValue(value: string[] | null): void {
        const newValue = value?.map(v => this.options._optionToValue(v)!);
        if (newValue) {
            this.selection?.setSelection(newValue);
        }
        executeAction(this.onChangeEvent);
    }
}
