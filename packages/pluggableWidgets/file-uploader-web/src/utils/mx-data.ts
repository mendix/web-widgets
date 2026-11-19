import { ObjectItem } from "mendix";

/**
 * Uploads the file content into a committed `System.FileDocument` object.
 *
 * TODO: replace once the Pluggable Widgets API can upload file contents (`mx.data` is not available in strict mode).
 */
export function saveFile(item: ObjectItem, fileToUpload: File): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        (window as any).mx.data.saveDocument(item.id, fileToUpload.name, {}, fileToUpload, resolve, reject);
    });
}
