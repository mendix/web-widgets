import type { ListAttributeValue } from "mendix";

export type SortDirection = "asc" | "desc";
export type ListAttributeId = ListAttributeValue["id"];
export type SortInstruction = [id: ListAttributeId, dir: SortDirection];

export type Option = {
    caption: string;
    value: ListAttributeId | null;
};

export interface SortingStoreInterface {
    options: Option[];
    value: ListAttributeId | null;
    direction: SortDirection;
    select(value: ListAttributeId | null): void;
    toggleDirection(): void;
}
