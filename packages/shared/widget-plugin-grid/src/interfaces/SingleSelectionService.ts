import { ObjectItem } from "mendix";

export interface SingleSelectionService {
    type: "Single";
    isSelected(item: ObjectItem): boolean;
    reduceTo(item: ObjectItem): void;
    remove(): void;
}
