import { ReferenceSetValue } from "mendix";
import { ComboboxContainerProps, SelectedItemsStyleEnum, SelectionMethodEnum } from "../../../typings/ComboboxProps";
import { MultiSelector } from "../types";
import { BaseAssociationSelector } from "./BaseAssociationSelector";
import { ThreeStateCheckBoxEnum } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import { sortSelections } from "../utils";

export class AssociationMultiSelector
    extends BaseAssociationSelector<string[], ReferenceSetValue>
    implements MultiSelector
{
    type = "multi" as const;
    selectedItemsStyle: SelectedItemsStyleEnum = "text";
    selectionMethod: SelectionMethodEnum = "checkbox";
    selectAllButton = false;
    selectedItemsSorting: "caption" | "value" | "none" = "value";
    private orderedSelections: string[] = [];

    updateProps(props: ComboboxContainerProps): void {
        super.updateProps(props);
        this.selectedItemsStyle = props.selectedItemsStyle;
        this.selectionMethod = props.selectionMethod;
        this.selectAllButton = props.selectAllButton;
        this.selectedItemsSorting = props.selectedItemsSorting;

        const newValues = this._attr?.value ?? null;
        if (newValues) {
            const newValueIds = newValues.map(v => v.id.toString());
            this.orderedSelections = sortSelections(newValueIds, this.selectedItemsSorting, id => this.caption.get(id));
            this.currentId = this.orderedSelections;
        } else {
            this.orderedSelections = [];
            this.currentId = null;
        }

        if (this.selectionMethod === "rowclick" || this.customContentType === "yes") {
            this.selectedItemsStyle = "boxes";
        }
    }

    setValue(value: string[] | null): void {
        this.orderedSelections = value || [];
        const newValue = this.orderedSelections.map(v => this.options._optionToValue(v)!);
        this._attr?.setValue(newValue);
        super.setValue(value);
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
}
