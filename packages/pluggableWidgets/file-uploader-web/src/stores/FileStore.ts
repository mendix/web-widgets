import { Big } from "big.js";
import { ListActionValue, ObjectItem } from "mendix";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import mimeTypes from "mime-types";

import { FileUploaderStore } from "./FileUploaderStore";
import {
    fetchDocumentUrl,
    fetchImageThumbnail,
    fetchMxObject,
    isImageObject,
    MxObject,
    removeObject,
    saveFile
} from "../utils/mx-data";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";

export type FileStatus =
    | "existingFile"
    | "missing"
    | "new"
    | "uploading"
    | "done"
    | "uploadingError"
    | "removedFile"
    | "validationError";

let fileKey = 0;

function getFileKey(): number {
    return fileKey++;
}

export class FileStore {
    fileStatus: FileStatus;

    _file?: File = undefined;
    _objectItem?: ObjectItem = undefined;
    _mxObject?: MxObject = undefined;
    _thumbnailUrl?: string = undefined;
    _rootStore: FileUploaderStore;

    key: number;

    errorDescription?: string = undefined;

    constructor(type: FileStatus, rootStore: FileUploaderStore, file?: File, objectItem?: ObjectItem) {
        this.key = getFileKey();
        this._file = file;
        this._objectItem = objectItem;
        this._rootStore = rootStore;
        this.fileStatus = type;

        makeObservable(this, {
            fileStatus: observable,
            _mxObject: observable,
            errorDescription: observable,
            _thumbnailUrl: observable,
            canRemove: computed,
            imagePreviewUrl: computed,
            upload: action,
            fetchMxObject: action,
            markMissing: action
        });
    }

    markMissing(): void {
        this.fileStatus = "missing";
        this._mxObject = undefined;
        this._objectItem = undefined;
    }

    canExecute(listAction: ListActionValue): boolean {
        if (!this._objectItem) {
            return false;
        }

        return listAction.get(this._objectItem).canExecute;
    }

    executeAction(listAction?: ListActionValue): void {
        if (listAction && this._objectItem) {
            executeAction(listAction.get(this._objectItem));
        }
    }

    validate(): boolean {
        return !(this.fileStatus !== "new" || !this._file);
    }

    async upload(): Promise<void> {
        if (this.fileStatus === "existingFile") {
            throw new Error("Calling upload on already uploaded files is not supported");
        }

        // set status
        runInAction(() => {
            this.fileStatus = "uploading";
        });

        try {
            // request object item
            this._objectItem = await this._rootStore.objectCreationHelper.request();
            await saveFile(this._objectItem, this._file!);
            await this.fetchMxObject();

            runInAction(() => {
                this.fileStatus = "done";
            });
        } catch (_e: unknown) {
            runInAction(() => {
                this.fileStatus = "uploadingError";
            });
        }
    }

    get title(): string {
        if (this._mxObject) {
            return this._mxObject.get2("Name")?.toString();
        }

        return this._file?.name ?? "...";
    }

    get size(): number {
        if (this._mxObject) {
            return (this._mxObject.get2("Size") as Big)?.toNumber();
        }

        return this._file?.size ?? -1;
    }

    get mimeType(): string {
        return mimeTypes.lookup(this.title) || "application/octet-stream";
    }

    get canRemove(): boolean {
        return (!this._rootStore.isReadOnly && this.fileStatus === "existingFile") || this.fileStatus === "done";
    }

    get canDownload(): boolean {
        return this.fileStatus === "done" || this.fileStatus === "existingFile";
    }

    get canExecuteActions(): boolean {
        return !!this._objectItem;
    }

    async remove(): Promise<void> {
        if (!this.canRemove || !this._objectItem) {
            return;
        }

        try {
            await removeObject(this._objectItem);
            runInAction(() => {
                this.fileStatus = "removedFile";
                this._mxObject = undefined;
                this.updateThumbnailUrl();
            });
        } catch (e: unknown) {
            console.error("Could not remove object:", e);
        }
    }

    async fetchMxObject(): Promise<void> {
        if (this._objectItem) {
            const obj = await fetchMxObject(this._objectItem!);
            runInAction(() => {
                this._mxObject = obj;
                this.updateThumbnailUrl();
            });
        }
    }

    async updateThumbnailUrl(): Promise<void> {
        if (this._rootStore._uploadMode !== "images") {
            return;
        }

        this._thumbnailUrl = undefined;
        if (this._mxObject && isImageObject(this._mxObject)) {
            const url = await fetchImageThumbnail(this._mxObject);
            runInAction(() => {
                this._thumbnailUrl = url;
            });
        }
    }

    get downloadUrl(): string | undefined {
        if (this._mxObject) {
            return fetchDocumentUrl(this._mxObject);
        }
    }

    get imagePreviewUrl(): string | undefined {
        if (this._rootStore._uploadMode !== "images") {
            return;
        }

        if (this._thumbnailUrl) {
            return this._thumbnailUrl;
        }
        if (this._file && this.mimeType.startsWith("image/")) {
            return URL.createObjectURL(this._file!);
        }

        return undefined;
    }

    static existingFile(objectItem: ObjectItem, rootStore: FileUploaderStore): FileStore {
        const store = new FileStore("existingFile", rootStore, undefined, objectItem);
        store.fetchMxObject();

        return store;
    }

    static newFile(file: File, rootStore: FileUploaderStore): FileStore {
        return new FileStore("new", rootStore, file, undefined);
    }

    static newFileWithError(file: File, errorMessage: string, rootStore: FileUploaderStore): FileStore {
        const store = new FileStore("validationError", rootStore, file, undefined);
        runInAction(() => {
            store.errorDescription = errorMessage;
        });

        return store;
    }
}
