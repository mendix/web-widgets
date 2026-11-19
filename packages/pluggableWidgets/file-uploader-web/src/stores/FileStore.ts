import { ObjectItem } from "mendix";
import mimeTypes from "mime-types";
import { action, makeObservable, observable } from "mobx";
import { saveFile } from "../utils/mx-data";

export type FileStatus =
    "creating" | "pending" | "uploading" | "done" | "uploadingError" | "validationError" | "rejected";

let fileKey = 0;

function getFileKey(): number {
    return fileKey++;
}

/** One file added by the user in this session. */
export class FileStore {
    fileStatus: FileStatus;
    errorDescription?: string = undefined;
    readonly key: number;

    private _objectItem?: ObjectItem = undefined;

    private constructor(
        type: FileStatus,
        public readonly file: File,
        errorDescription?: string
    ) {
        this.key = getFileKey();
        this.fileStatus = type;
        this.errorDescription = errorDescription;

        makeObservable<this, "setDone">(this, {
            fileStatus: observable,
            errorDescription: observable,
            setCreated: action,
            setFailed: action,
            setUploading: action,
            setDone: action
        });
    }

    get title(): string {
        return this.file.name;
    }

    get size(): number {
        return this.file.size;
    }

    get mimeType(): string {
        return mimeTypes.lookup(this.title) || "application/octet-stream";
    }

    get objectItemId(): ObjectItem["id"] | undefined {
        return this._objectItem?.id;
    }

    /** Files without an object can be removed from the list. Files with an object can't (no delete API yet). */
    get canDismiss(): boolean {
        return this.fileStatus === "validationError" || this.fileStatus === "rejected";
    }

    setCreated(item: ObjectItem): void {
        this._objectItem = item;
        this.fileStatus = "pending";
    }

    setFailed(): void {
        this.fileStatus = "uploadingError";
    }

    setUploading(): void {
        this.fileStatus = "uploading";
    }

    /** Uploads the content into the object. The object must already be committed. */
    async uploadContent(): Promise<boolean> {
        if (this.fileStatus !== "uploading" || !this._objectItem) {
            return false;
        }

        try {
            await saveFile(this._objectItem, this.file);
            this.setDone();
            return true;
        } catch (e: unknown) {
            console.warn(`Uploading file content to ${this._objectItem.id} has failed.`, e);
            // TODO: the object is already committed but has no contents. Decide whether to delete it,
            // let the app handle it with an action, or keep it as is.
            this.setFailed();
            return false;
        }
    }

    private setDone(): void {
        this.fileStatus = "done";
    }

    static newFile(file: File): FileStore {
        return new FileStore("creating", file);
    }

    static newRejectedFile(file: File): FileStore {
        return new FileStore("rejected", file);
    }

    static newFileWithValidationError(file: File, errorMessage: string): FileStore {
        return new FileStore("validationError", file, errorMessage);
    }
}
