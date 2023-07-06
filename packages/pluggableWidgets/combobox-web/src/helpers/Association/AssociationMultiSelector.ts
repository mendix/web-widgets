import { ObjectItem, ReferenceSetValue } from "mendix";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { MultiSelector, Status } from "../types";
import { AssociationOptionsProvider } from "./AssociationOptionsProvider";
import { AssociationSimpleCaptionsProvider } from "./AssociationSimpleCaptionsProvider";
import { extractMultiAssociationProps } from "./utils";

export class AssociationMultiSelector implements MultiSelector {
    status: Status = "unavailable";
    options: AssociationOptionsProvider;
    clearable = false;
    currentValue: string[] | undefined;
    caption: AssociationSimpleCaptionsProvider;
    private _attr: ReferenceSetValue | undefined;

    private _valuesMap: Map<string, ObjectItem> = new Map();

    constructor() {
        this.caption = new AssociationSimpleCaptionsProvider(this._valuesMap);
        this.options = new AssociationOptionsProvider(this.caption, this._valuesMap);
    }

    updateProps(props: ComboboxContainerProps) {
        const [attr, ds, captionProvider, emptyOption, clearable] = extractMultiAssociationProps(props);
        this._attr = attr;

        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider
        });

        this.options._updateProps({
            attr,
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
            this.currentValue = undefined;
            this.clearable = false;
            return;
        }

        this.clearable = clearable;
        // current value
        this.currentValue = attr.value?.map(value => {
            return value.id;
        });
        this.status = attr.status;
    }

    setValue(value: string[] | null) {
        const newValue = value?.map(v => this.options._optionToValue(v)!);

        this._attr?.setValue(newValue);
    }
}
