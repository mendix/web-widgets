import { ObjectItem, DynamicValue, ListAttributeValue } from "mendix";
import { ValuesProvider } from "../types";

interface Props {
    valueAttribute: ListAttributeValue<string | Big> | undefined;
    emptyValue?: DynamicValue<string | Big>;
}

export class DatabaseValuesProvider implements ValuesProvider<string | Big> {
    private attribute?: ListAttributeValue<string | Big>;
    private emptyValue?: DynamicValue<string | Big> | undefined;

    constructor(private optionsMap: Map<string, ObjectItem>) {}

    updateProps(props: Props): void {
        this.attribute = props.valueAttribute;
    }

    get(key: string | null): string | Big | undefined {
        if (key === null) {
            return this.emptyValue?.value;
        }

        const item = this.optionsMap.get(key);
        if (!item) {
            return this.emptyValue?.value;
        }

        if (this.attribute) {
            const value = this.attribute.get(item);
            if (value.status === "unavailable") {
                return this.emptyValue?.value;
            }
            return value.value;
        }

        return this.emptyValue?.value;
    }

    getEmptyValue(): string | Big | undefined {
        return this.emptyValue?.value;
    }
}
