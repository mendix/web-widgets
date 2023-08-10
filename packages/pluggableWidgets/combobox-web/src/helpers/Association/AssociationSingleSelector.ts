import { ReferenceValue } from "mendix";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { SingleSelector } from "../types";
import { BaseAssociationSelector } from "./BaseAssociationSelector";

export class AssociationSingleSelector
    extends BaseAssociationSelector<string, ReferenceValue>
    implements SingleSelector
{
    type = "single" as const;
    updateProps(props: ComboboxContainerProps): void {
        super.updateProps(props);
        this.currentValue = this._attr?.value?.id ?? null;
    }
    setValue(value: string | null): void {
        this._attr?.setValue(this.options._optionToValue(value));
        super.setValue(value);
    }
}
