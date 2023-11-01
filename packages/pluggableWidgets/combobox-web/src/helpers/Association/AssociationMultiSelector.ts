import { ReferenceSetValue } from "mendix";
import { ComboboxContainerProps, SelectionMethodEnum, SelectedItemsStyleEnum } from "../../../typings/ComboboxProps";
import { MultiSelector } from "../types";
import { BaseAssociationSelector } from "./BaseAssociationSelector";

export class AssociationMultiSelector
    extends BaseAssociationSelector<string[], ReferenceSetValue>
    implements MultiSelector
{
    type = "multi" as const;
    selectedItemsStyle: SelectedItemsStyleEnum = "text";
    selectionMethod: SelectionMethodEnum = "checkbox";
    updateProps(props: ComboboxContainerProps): void {
        super.updateProps(props);
        this.selectedItemsStyle = props.selectedItemsStyle;
        this.selectionMethod = props.selectionMethod;
        this.currentValue =
            this._attr?.value?.map(value => {
                return value.id;
            }) ?? null;
        if (this.selectionMethod === "rowclick") {
            this.selectedItemsStyle = "boxes";
        }
    }

    setValue(value: string[] | null): void {
        const newValue = value?.map(v => this.options._optionToValue(v)!);
        this._attr?.setValue(newValue);
        super.setValue(value);
    }

    getOptions(): string[] {
        return this.selectionMethod === "rowclick"
            ? this.options.getAll().filter(option => !this.currentValue?.includes(option))
            : this.options.getAll();
    }
}
