import { ReferenceSetValue } from "mendix";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { Selector } from "../types";
import { BaseAssociationSelector } from "./BaseAssociationSelector";

export class AssociationMultiSelector
    extends BaseAssociationSelector<string[], ReferenceSetValue>
    implements Selector<string[]>
{
    type = "multi" as const;
    updateProps(props: ComboboxContainerProps): void {
        super.updateProps(props);
        this.currentValue =
            this._attr?.value?.map(value => {
                return value.id;
            }) ?? null;
    }

    setValue(value: string[] | null): void {
        const newValue = value?.map(v => this.options._optionToValue(v)!);
        this._attr?.setValue(newValue);
    }
}
