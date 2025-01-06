import { ReferenceSetValue } from "mendix";
import { ComboboxContainerProps, SelectedItemsStyleEnum, SelectionMethodEnum } from "../../../typings/ComboboxProps";
import { MultiSelector } from "../types";
import { BaseAssociationSelector } from "./BaseAssociationSelector";
import { ThreeStateCheckBoxEnum } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";

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

            if (this.selectedItemsSorting === "none") {
                this.orderedSelections = [
                    ...this.orderedSelections.filter(id => newValueIds.includes(id)),
                    ...newValueIds.filter(id => !this.orderedSelections.includes(id))
                ];
            } else if (this.selectedItemsSorting === "caption") {
                this.orderedSelections = newValueIds.sort((a, b) => {
                    const captionA = this.caption.get(a)?.toString() ?? "";
                    const captionB = this.caption.get(b)?.toString() ?? "";
                    return captionA.localeCompare(captionB);
                });
            } else {
                this.orderedSelections = newValueIds.sort();
            }

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
        if (value === null) {
            this.orderedSelections = [];
        } else {
            this.orderedSelections = value;
        }
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
