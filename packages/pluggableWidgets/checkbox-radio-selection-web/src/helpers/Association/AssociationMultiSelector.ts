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
        this.currentId = this._attr?.value?.map(item => item.id) ?? [];
    }

    setValue(value: string[] | null): void {
        if (value && this._attr) {
            const currentValue = this._attr.value ?? [];
            const newValue = value
                ?.map(v => {
                    const knownObject = this.options._optionToValue(v);
                    if (knownObject) {
                        return knownObject;
                    }

                    // this option is not know, we need to look for it in the current value
                    const hiddenObject = currentValue.find(o => o.id === v);
                    if (hiddenObject) {
                        return hiddenObject;
                    }
                    console.info(`Object with ID ${v} not found. This value will be omitted.`);

                    return null;
                })
                .filter(v => !!v);
            this._attr.setValue(newValue);
        }

        super.setValue(value);
    }

    getOptions(): string[] {
        return this.options.getAll();
    }
}
