import { ObjectItem } from "mendix";
import { Big } from "big.js";

export type MxObject = {
    get2(name: string): string | Big | boolean;
};

export function saveFile(item: ObjectItem, fileToUpload: Blob): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        (window as any).mx.data.saveDocument(item.id, null, {}, fileToUpload, resolve, reject);
    });
}

export function removeObject(item: ObjectItem): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        (window as any).mx.data.remove({
            guid: item.id,
            callback: resolve,
            error: reject
        });
    });
}

export function fileHasContents(item: ObjectItem): boolean {
    const obj = (item as any)[Object.getOwnPropertySymbols(item)[0]];
    return !!obj.get2("HasContents");
}

export function fetchMxObject(objectItem: ObjectItem): Promise<MxObject> {
    return new Promise<MxObject>((resolve, reject) => {
        (window as any).mx.data.get({
            guid: objectItem.id,
            callback: resolve,
            error: reject
        });
    });
}
