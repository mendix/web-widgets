import { Big } from "big.js";
import { ObjectItem } from "mendix";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import fileSize from "filesize.js";
import { FileUploaderStore } from "./FileUploaderStore";
import { fetchMxObject, MxObject, saveFile } from "../utils/mx-data";

type FileStatus = "existingFile" | "new" | "uploading" | "done" | "uploadingError" | "removedFile" | "validationError";

let fileKey = 0;

function getFileKey(): number {
    return fileKey++;
}

export class FileStore {
    fileStatus: FileStatus;

    file?: File = undefined;
    objectItem?: ObjectItem = undefined;
    mxObject?: MxObject = undefined;
    rootStore: FileUploaderStore;

    key: number;

    errorDescription?: string = undefined;

    constructor(type: FileStatus, rootStore: FileUploaderStore, file?: File, objectItem?: ObjectItem) {
        this.key = getFileKey();
        this.file = file;
        this.objectItem = objectItem;
        this.rootStore = rootStore;
        this.fileStatus = type;

        makeObservable(this, {
            fileStatus: observable,
            mxObject: observable,
            errorDescription: observable,
            canRemove: computed,
            upload: action,
            fetchMxObject: action
        });
    }

    validate(): boolean {
        return !(this.fileStatus !== "new" || !this.file);
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
            this.objectItem = await this.rootStore.requestFileObject();
            if (this.objectItem) {
                await saveFile(this.objectItem, this.file!);
                await this.fetchMxObject();

                runInAction(() => {
                    this.fileStatus = "done";
                });
            } else {
                runInAction(() => {
                    this.fileStatus = "uploadingError";
                });
            }
        } catch (e: unknown) {
            runInAction(() => {
                this.fileStatus = "uploadingError";
            });
        }
    }

    get title(): string {
        if (this.mxObject) {
            return this.mxObject?.get2("Name").toString();
        }

        return this.file?.name ?? "...";
    }

    get size(): string {
        if (this.mxObject) {
            const size = (this.mxObject.get2("Size") as Big).toNumber();
            if (size === -1) {
                return "";
            }
            return fileSize(size);
        }

        const size = this.file?.size;
        if (size !== undefined) {
            return fileSize(size);
        }

        return "";
    }

    get canRemove(): boolean {
        return this.fileStatus === "existingFile" || this.fileStatus === "done";
    }

    remove(): void {
        if (!this.canRemove) {
            return;
        }

        (window as any).mx.data.remove({
            guid: this.objectItem?.id,
            callback: () => {
                runInAction(() => {
                    this.fileStatus = "removedFile";
                    this.mxObject = undefined;
                });
            },
            error(e: unknown) {
                console.error("Could not remove object:", e);
            }
        });
    }

    async fetchMxObject(): Promise<void> {
        if (this.objectItem) {
            const obj = await fetchMxObject(this.objectItem!);
            runInAction(() => {
                this.mxObject = obj;
            });
        }
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
