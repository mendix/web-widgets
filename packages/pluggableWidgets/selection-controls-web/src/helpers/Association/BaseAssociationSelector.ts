import { ActionValue, ObjectItem, ReferenceSetValue, ReferenceValue } from "mendix";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import {
    SelectionControlsContainerProps,
    OptionsSourceAssociationCustomContentTypeEnum
} from "../../../typings/SelectionControlsProps";
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
    customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    validation?: string = undefined;
    onEnterEvent?: () => void;
    onLeaveEvent?: () => void;
    protected _attr: R | undefined;
    private onChangeEvent?: ActionValue;
    private _valuesMap: Map<string, ObjectItem> = new Map();

    constructor() {
        this.caption = new AssociationSimpleCaptionsProvider(this._valuesMap);
        this.options = new AssociationOptionsProvider(this.caption, this._valuesMap);
    }

    updateProps(props: SelectionControlsContainerProps): void {
        const [attr, ds, captionProvider, emptyOption, clearable, onChangeEvent, customContent, customContentType] =
            extractAssociationProps(props);

        this._attr = attr as R;
        this.caption.updateProps({
            emptyOptionText: emptyOption,
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
        this.onEnterEvent = props.onEnterEvent ? () => executeAction(props.onEnterEvent) : undefined;
        this.onLeaveEvent = props.onLeaveEvent ? () => executeAction(props.onLeaveEvent) : undefined;
        this.customContentType = customContentType;
        this.validation = attr.validation;
    }

    setValue(_value: T | null): void {
        executeAction(this.onChangeEvent);
    }
}
