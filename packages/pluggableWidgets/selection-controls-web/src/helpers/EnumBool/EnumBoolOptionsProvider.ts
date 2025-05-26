import { EditableValue } from "mendix";
import { FilterTypeEnum } from "../../../typings/ComboboxProps";
import { BaseOptionsProvider } from "../BaseOptionsProvider";

export class EnumBoolOptionsProvider<T extends boolean | string> extends BaseOptionsProvider<
    T,
    { attribute: EditableValue<string | boolean> }
> {
    private isBoolean = false;

    _updateProps(props: { attribute: EditableValue<string | boolean>; filterType: FilterTypeEnum }): void {
        if (props.attribute.status === "unavailable") {
            this.options = [];
        }
        this.filterType = props.filterType;
        this.options = (props.attribute.universe ?? []).map(o => o.toString());
        this.isBoolean = typeof props.attribute.universe?.[0] === "boolean";
    }

    _optionToValue(value: string | null): T | undefined {
        if (this.isBoolean) {
            return (value === "true") as T;
        } else {
            return (value ?? undefined) as T;
        }
    }

    _valueToOption(value: string | boolean | undefined): string | null {
        return value?.toString() ?? null;
    }
}
