import { ActionValue, ObjectItem, ReferenceSetValue, ReferenceValue } from "mendix";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import {
    CheckboxRadioSelectionContainerProps,
    OptionsSourceCustomContentTypeEnum
} from "../../../typings/CheckboxRadioSelectionProps";
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
    customContentType: OptionsSourceCustomContentTypeEnum = "no";
    validation?: string = undefined;
    protected _attr: R | undefined;
    private onChangeEvent?: ActionValue;
    private _valuesMap: Map<string, ObjectItem> = new Map();

    constructor() {
        this.caption = new AssociationSimpleCaptionsProvider(this._valuesMap);
        this.options = new AssociationOptionsProvider(this.caption, this._valuesMap);
    }

    updateProps(props: CheckboxRadioSelectionContainerProps): void {
        const [attr, ds, captionProvider, noOptions, clearable, onChangeEvent, customContent, customContentType] =
            extractAssociationProps(props);

        this._attr = attr as R;
        this.caption.updateProps({
            noOptionsText: noOptions,
            formattingAttributeOrExpression: captionProvider,
            customContent,
            customContentType
        });

        this.options._updateProps({
            ds
        });

        if (
            !attr ||
            attr.status === "unavailable" ||
            !ds ||
            ds.status === "unavailable" ||
            !captionProvider ||
            !noOptions ||
            noOptions.status === "unavailable"
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
    }

    setValue(_value: T | null): void {
        executeAction(this.onChangeEvent);
    }
}
