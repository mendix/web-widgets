import { Serializable } from "@mendix/filter-commons/typings/settings";
import type { ListAttributeValue } from "mendix";

export type SortDirection = "asc" | "desc";

export type ListAttributeId = ListAttributeValue["id"];

export type SortInstruction = [id: ListAttributeId, dir: SortDirection];

export type Option = {
    caption: string;
    value: ListAttributeId;
};

export interface ObservableSortStore extends Serializable {
    sortOrder: SortInstruction[];
    setSortOrder(...item: SortInstruction[]): void;
}

export interface BasicSortStore extends ObservableSortStore {
    options: Option[];
    push(...item: SortInstruction[]): void;
    remove(index: number): void;
}
