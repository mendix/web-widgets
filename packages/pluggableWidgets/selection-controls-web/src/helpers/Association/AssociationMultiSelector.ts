import { ReferenceSetValue } from "mendix";
import { SelectionControlsContainerProps } from "../../../typings/SelectionControlsProps";
import { MultiSelector } from "../types";
import { BaseAssociationSelector } from "./BaseAssociationSelector";

export class AssociationMultiSelector
    extends BaseAssociationSelector<string[], ReferenceSetValue>
    implements MultiSelector
{
    type = "multi" as const;

    updateProps(props: SelectionControlsContainerProps): void {
        super.updateProps(props);

        // Convert reference set value to array of IDs
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
