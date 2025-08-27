import { ReferenceSetValue } from "mendix";
import { CheckboxRadioSelectionContainerProps } from "../../../typings/CheckboxRadioSelectionProps";
import { MultiSelector } from "../types";
import { BaseAssociationSelector } from "./BaseAssociationSelector";

export class AssociationMultiSelector
    extends BaseAssociationSelector<string[], ReferenceSetValue>
    implements MultiSelector
{
    type = "multi" as const;

    updateProps(props: CheckboxRadioSelectionContainerProps): void {
        super.updateProps(props);

        // Convert reference set value to array of IDs
        console.log("AssociationMultiSelector updateProps", props);
        this.currentId = this._attr?.value?.map(item => item.id) ?? [];
    }

    setValue(value: string[] | null): void {
        const newValue = value?.map(v => this.options._optionToValue(v)!);
        this._attr?.setValue(newValue);
        super.setValue(value);
    }

    getOptions(): string[] {
        return this.options.getAll();
    }
}
