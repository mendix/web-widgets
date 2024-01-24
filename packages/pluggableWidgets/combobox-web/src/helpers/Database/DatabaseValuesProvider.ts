import { ListExpressionValue, ObjectItem } from "mendix";
import { ValuesProvider } from "../types";

interface Props {
    valueExpression: ListExpressionValue<any>;
}

export class DatabaseValuesProvider<T> implements ValuesProvider<T> {
    private formatter?: ListExpressionValue<any>;
    emptyValue: T = "" as T;

    constructor(private optionsMap: Map<string, ObjectItem>) {}

    updateProps(props: Props): void {
        this.formatter = props.valueExpression;
    }

    get(key: string | null): T {
        if (key === null) {
            return this.emptyValue;
        }
        if (!this.formatter) {
            throw new Error("AssociationSimpleCaptionRenderer: no formatter available.");
        }
        const item = this.optionsMap.get(key);
        if (!item) {
            return this.emptyValue;
        }

        const captionValue = this.formatter.get(item);
        if (captionValue.status === "unavailable") {
            return this.emptyValue;
        }

        return (captionValue.value ?? "") as T;
    }
}
