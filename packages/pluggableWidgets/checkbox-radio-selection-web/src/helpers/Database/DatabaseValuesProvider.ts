import { ListAttributeValue, ObjectItem } from "mendix";
import { Big } from "big.js";
import { ValuesProvider } from "../types";

interface DatabaseValuesProviderProps {
    valueAttribute?: ListAttributeValue<string | Big>;
}

export class DatabaseValuesProvider implements ValuesProvider<string | Big> {
    private _objectsMap: Map<string, ObjectItem>;
    private valueAttribute?: ListAttributeValue<string | Big>;

    constructor(objectsMap: Map<string, ObjectItem>) {
        this._objectsMap = objectsMap;
    }

    updateProps(props: DatabaseValuesProviderProps): void {
        this.valueAttribute = props.valueAttribute;
    }

    get(key: string | null): string | Big | undefined {
        if (!key) {
            return undefined;
        }

        const item = this._objectsMap.get(key);
        if (!item) {
            return undefined;
        }

        if (this.valueAttribute) {
            return this.valueAttribute.get(item).value;
        }

        // Default to using the object ID if no value attribute is specified
        return item.id;
    }
}
