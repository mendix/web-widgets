import { DynamicValue, ListAttributeValue, ListValue } from "mendix";
import { SortAPI } from "../context";
import { value } from "../result-meta";
import { SortingStore } from "../stores/SortingStore";

interface SortListType {
    attribute: ListAttributeValue;
    caption: DynamicValue<string>;
}

interface Props {
    datasource: ListValue;
    sortList: SortListType[];
}

export class SortAPIProvider {
    context: SortAPI;

    constructor(props: Props) {
        const options = props.sortList.map(item => ({
            value: item.attribute.id,
            caption: `${item.caption?.value}`
        }));

        this.context = {
            version: 1,
            store: value(new SortingStore(options, props.datasource.sortOrder))
        };
    }
}
