import { ThreeStateCheckBoxEnum } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import { ListAttributeValue, ObjectItem, SelectionMultiValue } from "mendix";
import {
    ComboboxContainerProps,
    LoadingTypeEnum,
    OptionsSourceAssociationCustomContentTypeEnum,
    SelectedItemsSortingEnum,
    SelectedItemsStyleEnum,
    SelectionMethodEnum
} from "../../../typings/ComboboxProps";
import { LazyLoadProvider } from "../LazyLoadProvider";
import { MultiSelector, Status } from "../types";
import { sortSelectedItems } from "../utils";
import { DatabaseCaptionsProvider } from "./DatabaseCaptionsProvider";
import { DatabaseOptionsProvider } from "./DatabaseOptionsProvider";
import { extractDatabaseProps } from "./utils";

export class DatabaseMultiSelectionSelector implements MultiSelector {
    caption: DatabaseCaptionsProvider;
    clearable = false;
    currentId: string[] | null = null;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    options: DatabaseOptionsProvider;
    lazyLoading = false;
    loadingType?: LoadingTypeEnum;
    readOnly = false;
    selectAllButton = false;
    selectedItemsStyle: SelectedItemsStyleEnum = "text";
    selection?: SelectionMultiValue;
    selectionMethod: SelectionMethodEnum = "checkbox";
    status: Status = "unavailable";
    type = "multi" as const;
    protected lazyLoader: LazyLoadProvider = new LazyLoadProvider();
    private _objectsMap: Map<string, ObjectItem> = new Map();
    selectedItemsSorting: SelectedItemsSortingEnum = "none";

    constructor() {
        this.caption = new DatabaseCaptionsProvider(this._objectsMap);
        this.options = new DatabaseOptionsProvider(this.caption, this._objectsMap);
    }

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
        const {
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

        this.lazyLoader.updateProps(ds);
        this.lazyLoader.setLimit(this.lazyLoader.getLimit(ds.limit, false, ds.status, lazyLoading));
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
            filterType,
            lazyLoading,
            attributeId: captionType === "attribute" ? (captionProvider as ListAttributeValue<string>).id : undefined
        });

        if (this.selectionMethod === "rowclick" || this.customContentType === "yes") {
            this.selectedItemsStyle = "boxes";
        }

        this.clearable = clearable;
        this.customContentType = customContentType;
        this.lazyLoading = lazyLoading;
        this.loadingType = loadingType;
        this.selectAllButton = props.selectAllButton;
        this.selectedItemsStyle = props.selectedItemsStyle;
        this.selection = props.optionsSourceDatabaseItemSelection as SelectionMultiValue;
        this.selectionMethod = props.selectionMethod;
        this.selectedItemsSorting = props.selectedItemsSorting;

        this.currentId = sortSelectedItems(
            this.selection?.selection,
            this.selectedItemsSorting,
            this.options.sortOrder,
            id => this.caption.get(id)
        );
    }

    setValue(value: string[] | null): void {
        const newValue = value?.map(v => this.options._optionToValue(v)!);
        if (newValue) {
            this.selection?.setSelection(newValue);
        }
    }
}
