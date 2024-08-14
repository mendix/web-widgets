import { ActionValue, ListAttributeValue, ObjectItem } from "mendix";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import {
    ComboboxContainerProps,
    LoadingTypeEnum,
    OptionsSourceAssociationCustomContentTypeEnum
} from "../../../typings/ComboboxProps";
import { LazyLoadProvider } from "../LazyLoadProvider";
import { SingleSelector, Status } from "../types";
import { DatabaseCaptionsProvider } from "./DatabaseCaptionsProvider";
import { DatabaseOptionsProvider } from "./DatabaseOptionsProvider";
import { extractDatabaseProps } from "./utils";

export class BaseDatabaseSingleSelector<T extends string | Big> implements SingleSelector {
    caption: DatabaseCaptionsProvider;
    clearable = false;
    currentId: string | null = null;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    lastSetValue?: T | null = null;
    lazyLoading = false;
    loadingType?: LoadingTypeEnum;
    options: DatabaseOptionsProvider;
    readOnly = false;
    status: Status = "unavailable";
    type = "single" as const;
    protected _objectsMap: Map<string, ObjectItem> = new Map();
    protected onChangeEvent?: ActionValue;
    protected lazyLoader: LazyLoadProvider = new LazyLoadProvider();

    constructor() {
        this.caption = new DatabaseCaptionsProvider(this._objectsMap);
        this.options = new DatabaseOptionsProvider(this.caption, this._objectsMap);
    }

    updateProps(props: ComboboxContainerProps): void {
        const {
            captionProvider,
            captionType,
            clearable,
            customContentType,
            ds,
            filterType,
            lazyLoading,
            loadingType,
            onChangeEvent
        } = extractDatabaseProps(props);

        this.lazyLoader.updateProps(ds);
        this.options._updateProps({
            ds,
            filterType,
            lazyLoading,
            attributeId: captionType === "attribute" ? (captionProvider as ListAttributeValue<string>).id : undefined
        });

        this.clearable = clearable;
        this.onChangeEvent = onChangeEvent;
        this.customContentType = customContentType;
        this.lazyLoading = lazyLoading;
        this.loadingType = loadingType;
    }

    setValue(objectId: string | null): void {
        this.currentId = objectId;
        executeAction(this.onChangeEvent);
    }
}
