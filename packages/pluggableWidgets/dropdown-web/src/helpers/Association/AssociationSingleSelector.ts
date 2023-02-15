import { SingleSelector, Status } from "../types";
import { AssociationSimpleCaptionsProvider } from "./AssociationSimpleCaptionsProvider";
import { ObjectItem, ReferenceValue } from "mendix";
import { DropdownContainerProps } from "../../../typings/DropdownProps";
import { extractAssociationProps } from "./utils";
import { AssociationOptionsProvider } from "./AssociationOptionsProvider";

export class AssociationSingleSelector implements SingleSelector {
    status: Status = "unavailable";
    options: AssociationOptionsProvider;
    clearable: boolean = false;
    currentValue: string | null = null;
    caption: AssociationSimpleCaptionsProvider;
    private _attr: ReferenceValue | undefined;

    private _valuesMap: Map<string, ObjectItem> = new Map();

    constructor() {
        this.caption = new AssociationSimpleCaptionsProvider(this._valuesMap);
        this.options = new AssociationOptionsProvider(this.caption, this._valuesMap);
    }

    updateProps(props: DropdownContainerProps) {
        const [attr, ds, captionProvider, emptyOption, clearable, sa] = extractAssociationProps(props);
        this._attr = attr;

        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider
        });

        this.options._updateProps({
            attr: attr,
            ds: ds,
            searchableAttributes: [sa!]
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
            this.currentValue = null;
            this.clearable = false;

            return;
        }

        this.clearable = clearable;

        // current value
        this.currentValue = (attr.value?.id as string) ?? null;

        this.status = attr.status;
    }

    setValue(value: string | null) {
        this._attr?.setValue(this.options._optionToValue(value));
    }
}
