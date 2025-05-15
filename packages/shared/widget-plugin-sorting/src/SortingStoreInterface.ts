import type { ListAttributeValue } from "mendix";
import { ObservableSortStore } from "./ObservableSortStoreHost";

export type SortDirection = "asc" | "desc";
export type ListAttributeId = ListAttributeValue["id"];
export type SortInstruction = [id: ListAttributeId, dir: SortDirection];

export type Option = {
    caption: string;
    value: ListAttributeId | null;
};

export interface SortingStoreInterface extends ObservableSortStore {
    options: Option[];
    value: ListAttributeId | null;
    direction: SortDirection;
    select(value: ListAttributeId | null): void;
    toggleDirection(): void;
}
