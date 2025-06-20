import type { ListAttributeValue } from "mendix";

export type SortDirection = "asc" | "desc";

export type ListAttributeId = ListAttributeValue["id"];

export type SortInstruction = [id: ListAttributeId, dir: SortDirection];

export type Option = {
    caption: string;
    value: ListAttributeId;
};

export interface ObservableSortStore {
    sortOrder: SortInstruction[];
}

export interface BasicSortStore extends ObservableSortStore {
    options: Option[];
    sortOrder: SortInstruction[];
    push(...item: SortInstruction[]): void;
    remove(index: number): void;
    replace(...item: SortInstruction[]): void;
}

export interface Serializable {
    toJSON(): unknown;
    fromJSON(json: unknown): void;
}
