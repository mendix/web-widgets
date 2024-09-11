import { makeObservable, computed } from "mobx";
import { DynamicValue, ListAttributeValue, ListValue } from "mendix";
import { SortAPI } from "../context";
import { value } from "../result-meta";
import { SortingStore } from "../stores/SortingStore";
import { SortInstruction } from "../typings";

export interface SortListType {
    attribute: ListAttributeValue;
    caption: DynamicValue<string>;
}

interface Props {
    datasource: ListValue;
    sortList: SortListType[];
}

export class SortAPIProvider {
    private store: SortingStore;
    context: SortAPI;

    constructor(props: Props) {
        const options = props.sortList.map(item => ({
            value: item.attribute.id,
            caption: `${item.caption?.value}`
        }));

        this.store = new SortingStore(options, props.datasource.sortOrder);

        this.context = {
            version: 1,
            store: value(this.store)
        };

        makeObservable(this, { sortOrder: computed });
    }

    get sortOrder(): SortInstruction[] {
        return this.store.sortOrder;
    }
}
