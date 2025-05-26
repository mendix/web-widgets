import { ActionValue, ListAttributeValue, ObjectItem, ReferenceSetValue, ReferenceValue } from "mendix";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import {
    ComboboxContainerProps,
    LoadingTypeEnum,
    OptionsSourceAssociationCustomContentTypeEnum
} from "../../../typings/ComboboxProps";
import { LazyLoadProvider } from "../LazyLoadProvider";
import { Status } from "../types";
import { AssociationOptionsProvider } from "./AssociationOptionsProvider";
import { AssociationSimpleCaptionsProvider } from "./AssociationSimpleCaptionsProvider";
import { extractAssociationProps } from "./utils";

export class BaseAssociationSelector<T extends string | string[], R extends ReferenceSetValue | ReferenceValue> {
    status: Status = "unavailable";
    options: AssociationOptionsProvider;
    clearable = false;
    currentId: T | null = null;
    caption: AssociationSimpleCaptionsProvider;
    readOnly = false;
    lazyLoading = false;
    loadingType?: LoadingTypeEnum;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    validation?: string = undefined;
    protected _attr: R | undefined;
    private onChangeEvent?: ActionValue;
    private _valuesMap: Map<string, ObjectItem> = new Map();
    private lazyLoader: LazyLoadProvider = new LazyLoadProvider();

    constructor() {
        this.caption = new AssociationSimpleCaptionsProvider(this._valuesMap);
        this.options = new AssociationOptionsProvider(this.caption, this._valuesMap);
    }

    updateProps(props: ComboboxContainerProps): void {
        const [
            attr,
            ds,
            captionProvider,
            captionType,
            emptyOption,
            clearable,
            filterType,
            onChangeEvent,
            customContent,
            customContentType,
            lazyLoading,
            loadingType
        ] = extractAssociationProps(props);

        this.lazyLoader.updateProps(ds);
        this.lazyLoader.setLimit(this.lazyLoader.getLimit(ds.limit, attr.readOnly, attr.status, lazyLoading));

        this._attr = attr as R;
        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider,
            customContent,
            customContentType
        });

        this.options._updateProps({
            attr,
            ds,
            filterType,
            lazyLoading,
            attributeId: captionType === "attribute" ? (captionProvider as ListAttributeValue<string>).id : undefined
        });

        if (
            !attr ||
            attr.status === "unavailable" ||
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

    setValue(_value: T | null): void {
        executeAction(this.onChangeEvent);
    }
}
