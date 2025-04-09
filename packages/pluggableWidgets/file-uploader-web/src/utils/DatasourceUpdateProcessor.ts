import { ListValue, ObjectItem } from "mendix";
import { fileHasContents } from "./mx-data";

export interface DatasourceUpdateProcessorCallbacks {
    loaded(): void;
    processExisting(item: ObjectItem): void;
    processNew(item: ObjectItem): void;
    processMissing(item: ObjectItem): void;
}

export class DatasourceUpdateProcessor {
    existingItemsLoaded = false;

    seenItems = new Set<ObjectItem["id"]>();
    guidToObject = new Map<ObjectItem["id"], ObjectItem>();

    constructor(private readonly callbacks: DatasourceUpdateProcessorCallbacks) {}

    addToMap(obj: ObjectItem): void {
        this.guidToObject.set(obj.id, obj);
    }

    processUpdate(itemsDs: ListValue): void {
        if (!this.existingItemsLoaded) {
            if (itemsDs.status === "available" && itemsDs.items) {
                for (const item of itemsDs.items) {
                    this.seenItems.add(item.id);
                    this.callbacks.processExisting(item);
                }

                this.existingItemsLoaded = true;
                this.callbacks.loaded();
            }
        }

        const currentItems = itemsDs.items;

        if (!currentItems) {
            return;
        }

        const currentItemsSet = new Set<ObjectItem["id"]>();
        currentItems.forEach(item => {
            this.addToMap(item);
            currentItemsSet.add(item.id);
        });

        const newItems = new Set([...currentItemsSet].filter(x => !this.seenItems.has(x)));
        const missingItems = new Set([...this.seenItems].filter(x => !currentItemsSet.has(x)));

        // missing
        for (const missingItem of missingItems) {
            this.seenItems.delete(missingItem);
            this.callbacks.processMissing(this.guidToObject.get(missingItem)!);
        }

        // new
        for (const newItem of newItems) {
            const obj = this.guidToObject.get(newItem)!;
            this.seenItems.add(newItem);
            if (fileHasContents(obj)) {
                this.callbacks.processExisting(obj);
            } else {
                this.callbacks.processNew(obj);
            }
        }
    }
}
