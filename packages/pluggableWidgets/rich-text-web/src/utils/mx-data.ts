import { ObjectItem } from "mendix";
import { Big } from "big.js";

export type MxObject = {
    getGuid(): string;
    getEntity(): string;
    get(name: string): string | Big | boolean;
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

export function getMxObject(item: ObjectItem): MxObject {
    return (item as any)[Object.getOwnPropertySymbols(item)[0]];
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

export function isImageObject(mxObject: MxObject): boolean {
    return (window as any).mx.meta.getEntity(mxObject.getEntity()).isA("System.Image");
}

export function fetchDocumentUrl(guid: string, changeDate?: number): string {
    return (window as any).mx.data.getDocumentUrl(guid, changeDate ?? Date.now(), false);
}

export function fetchImageThumbnail(docUrl: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        (window as any).mx.data.getImageUrl(docUrl, resolve, reject);
    });
}
