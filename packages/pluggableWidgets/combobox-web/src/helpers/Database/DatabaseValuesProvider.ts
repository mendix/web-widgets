import { ObjectItem, DynamicValue, ListAttributeValue } from "mendix";
import { ValuesProvider } from "../types";

interface Props {
    valueAttribute: ListAttributeValue<string | Big>;
    emptyValue: DynamicValue<string | Big>;
}

export class DatabaseValuesProvider implements ValuesProvider<string | Big> {
    private attribute?: ListAttributeValue<string | Big>;
    private emptyValue: DynamicValue<string | Big> | undefined;

    constructor(private optionsMap: Map<string, ObjectItem>) {}

    updateProps(props: Props): void {
        this.emptyValue = props.emptyValue;
        this.attribute = props.valueAttribute;
    }

    get(key: string | null): string | Big | undefined {
        if (key === null) {
            return this.emptyValue?.value;
        }
        if (!this.attribute) {
            throw new Error("DatabaseValuesProvider: no formatter available.");
        }
        const item = this.optionsMap.get(key);
        if (!item) {
            return this.emptyValue?.value;
        }
        const value = this.attribute.get(item);
        if (value.status === "unavailable") {
            return this.emptyValue?.value;
        }
        return value.value;
    }

    getEmptyValue(): string | Big | undefined {
        return this.emptyValue?.value;
    }
}
