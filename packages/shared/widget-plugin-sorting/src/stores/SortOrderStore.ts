import { PlainJs, Serializable } from "@mendix/filter-commons/typings/settings";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { action, computed, makeObservable, observable } from "mobx";
import { BasicSortStore, Option, SortInstruction } from "../types/store";
import { AttributeMetaData, DynamicValue } from "mendix";

type StorableState = Array<[number, "asc" | "desc"]>;

type Props = {
    attributes: Array<{
        attribute: AttributeMetaData;
        caption?: DynamicValue<string>;
    }>;
};

export class SortOrderStore implements BasicSortStore, Serializable {
    private readonly _sortOrder: SortInstruction[] = [];

    readonly id = `SortOrderStore@${generateUUID()}`;
    options: Option[] = [];
    readonly idToIndex: Map<string, number> = new Map();

    constructor(spec: { initSortOrder?: SortInstruction[] }) {
        const { initSortOrder = [] } = spec;
        this._sortOrder = [...initSortOrder];

        makeObservable<this, "_sortOrder">(this, {
            _sortOrder: observable,
            options: observable.struct,
            sortOrder: computed,
            setSortOrder: action,
            setProps: action,
            push: action,
            remove: action
        });
    }

    setProps(props: Props): void {
        this.options = props.attributes.map(item => ({
            value: item.attribute.id,
            caption: item.caption?.value ?? "<empty>"
        }));

        this.idToIndex.clear();
        this.options.forEach((option, index) => {
            this.idToIndex.set(option.value, index);
        });
    }

    get sortOrder(): SortInstruction[] {
        return [...this._sortOrder];
    }

    setSortOrder(...order: SortInstruction[]): void {
        this._sortOrder.splice(0, this._sortOrder.length, ...order);
    }

    push(...item: SortInstruction[]): void {
        this._sortOrder.push(...item);
    }

    remove(index: number): void {
        if (index >= 0 && index < this._sortOrder.length) {
            this._sortOrder.splice(index, 1);
        }
    }

    toJSON(): PlainJs {
        const data: StorableState = this.sortOrder.map(inst => {
            const index = this.idToIndex.get(inst[0])!;
            return [index, inst[1]];
        });

        return data;
    }

    fromJSON(data: PlainJs): void {
        if (!Array.isArray(data)) {
            return;
        }
        const sortOrder = (data as StorableState).flatMap<SortInstruction>(([index, direction]) => {
            const value = this.options[index]?.value;
            return value ? [[value, direction]] : [];
        });

        this.setSortOrder(...sortOrder);
    }
}
