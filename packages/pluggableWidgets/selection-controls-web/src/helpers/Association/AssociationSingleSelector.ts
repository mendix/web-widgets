import { ReferenceValue } from "mendix";
import { SelectionControlsContainerProps } from "../../../typings/SelectionControlsProps";
import { SingleSelector } from "../types";
import { BaseAssociationSelector } from "./BaseAssociationSelector";

export class AssociationSingleSelector
    extends BaseAssociationSelector<string, ReferenceValue>
    implements SingleSelector
{
    type = "single" as const;
    groupName: string;

    constructor() {
        super();
        this.groupName = `single-selection-${Math.random().toString(36).substring(2, 15)}`;
    }
    updateProps(props: SelectionControlsContainerProps): void {
        super.updateProps(props);
        this.currentId = this._attr?.value?.id ?? null;
    }
    setValue(value: string | null): void {
        this._attr?.setValue(this.options._optionToValue(value));
        super.setValue(value);
    }
}
