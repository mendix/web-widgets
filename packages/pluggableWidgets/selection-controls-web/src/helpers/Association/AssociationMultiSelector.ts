import { ReferenceSetValue } from "mendix";
import { SelectionControlsContainerProps } from "../../../typings/SelectionControlsProps";
import { MultiSelector } from "../types";
import { BaseAssociationSelector } from "./BaseAssociationSelector";

export class AssociationMultiSelector
    extends BaseAssociationSelector<string[], ReferenceSetValue>
    implements MultiSelector
{
    type = "multi" as const;
    groupName: string;

    constructor() {
        super();
        this.groupName = `multi-selection-${Math.random().toString(36).substring(2, 15)}`;
    }

    updateProps(props: SelectionControlsContainerProps): void {
        super.updateProps(props);

        // this.currentId = sortSelectedItems(this._attr?.value, this.selectedItemsSorting, this.options.sortOrder, id =>
        //     this.caption.get(id)
        // );
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
