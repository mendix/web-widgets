import { ReferenceValue } from "mendix";
import { action, makeObservable, override } from "mobx";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { SingleSelector } from "../types";
import { BaseAssociationSelector } from "./BaseAssociationSelector";

export class AssociationSingleSelector
    extends BaseAssociationSelector<string, ReferenceValue>
    implements SingleSelector
{
    type = "single" as const;

    constructor(props: { filterInputDebounceInterval: number }) {
        super(props);
        makeObservable(this, { updateProps: override, setValue: action });
    }

    updateProps(props: ComboboxContainerProps): void {
        super.updateProps(props);
        this.currentId = this._attr?.value?.id ?? null;
    }
    setValue(value: string | null): void {
        this._attr?.setValue(this.options._optionToValue(value));
    }
}
