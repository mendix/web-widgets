import { Big } from "big.js";
import { ActionValue, DynamicValue, ListActionValue, ListValue } from "mendix";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { FileRejection } from "react-dropzone";
import { FileStore } from "./FileStore";
import { TranslationsStore } from "./TranslationsStore";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { ActionGetter, ActionRunner } from "../utils/ActionRunner";
import { canCreate, isCreatable } from "../utils/creatableListValue";
import { UPLOAD_ON_CREATE } from "../utils/flags";
import { parseAllowedFormats } from "../utils/parseAllowedFormats";
import { FileCheckFormat } from "../utils/predefinedFormats";

export class FileUploaderStore {
    files: FileStore[] = [];
    acceptedFileTypes: FileCheckFormat[];
    createActionFailed = false;
    isUploading = false;
    announcement: { text: string; seq: number } = { text: "", seq: 0 };

    private _widgetName: string;
    private _maxFileSizeMiB: number;
    private _maxFileSize: number;
    private _maxTotalFiles: DynamicValue<Big> | undefined;
    private _datasource: ListValue;
    private _uploadAction: ActionValue | undefined;
    private _uploadItemAction: ListActionValue | undefined;
    private _removeAction: ListActionValue | undefined;
    private _removeRunner: ActionRunner;
    private _uploadQueue: FileStore[] = [];
    private translations: TranslationsStore;

    constructor(props: FileUploaderContainerProps, translations: TranslationsStore) {
        this._widgetName = props.name;
        this._maxFileSizeMiB = props.maxFileSize;
        this._maxFileSize = this._maxFileSizeMiB * 1024 * 1024;
        this._maxTotalFiles = props.maxFilesPerUpload;
        this._datasource = props.files;
        this._uploadAction = props.uploadAction;
        this._uploadItemAction = props.uploadItemAction;
        this._removeAction = props.removeAction;
        this._removeRunner = new ActionRunner(props.removeActionTimeout);
        this.acceptedFileTypes = parseAllowedFormats(props.allowedFileFormats);
        this.translations = translations;

        makeObservable<
            this,
            "_maxTotalFiles" | "_datasource" | "_uploadAction" | "_uploadItemAction" | "_removeAction"
        >(this, {
            files: observable,
            createActionFailed: observable,
            isUploading: observable,
            announcement: observable.ref,
            _maxTotalFiles: observable.ref,
            _datasource: observable.ref,
            _uploadAction: observable.ref,
            _uploadItemAction: observable.ref,
            _removeAction: observable.ref,
            updateProps: action,
            processDrop: action,
            dismissFile: action,
            announce: action,
            canCreateFiles: computed,
            maxTotalFiles: computed,
            activeCount: computed,
            isFileUploadLimitReached: computed,
            sortedFiles: computed,
            allowedFormatsDescription: computed
        });
    }

    updateProps(props: FileUploaderContainerProps): void {
        this._maxTotalFiles = props.maxFilesPerUpload;
        this._datasource = props.files;
        this._uploadAction = props.uploadAction;
        this._uploadItemAction = props.uploadItemAction;
        this._removeAction = props.removeAction;
        this.translations.updateProps(props);
        this._removeRunner.update();
    }

    dispose(): void {
        this._removeRunner.dispose();
    }

    get canCreateFiles(): boolean {
        return canCreate(this._datasource);
    }

    get maxFileSize(): number {
        return this._maxFileSize;
    }

    get maxTotalFiles(): number {
        return this._maxTotalFiles?.value?.toNumber() ?? 0;
    }

    /** Files that count towards the file limit: everything that has, or will get, an object. */
    get activeCount(): number {
        return this.files.filter(f =>
            ["creating", "pending", "removing", "uploading", "done", "uploadingError"].includes(f.fileStatus)
        ).length;
    }

    get isFileUploadLimitReached(): boolean {
        return this.maxTotalFiles > 0 && this.activeCount >= this.maxTotalFiles;
    }

    /** Validation errors last. */
    get sortedFiles(): FileStore[] {
        return [...this.files].sort((a, b) => {
            const isErrorA = a.fileStatus === "validationError" || a.fileStatus === "rejected" ? 1 : 0;
            const isErrorB = b.fileStatus === "validationError" || b.fileStatus === "rejected" ? 1 : 0;
            return isErrorA - isErrorB;
        });
    }

    get allowedFormatsDescription(): string {
        return this.acceptedFileTypes
            .map(f => f.description)
            .filter(_ => _)
            .join(", ");
    }

    announce(key: keyof FileUploaderContainerProps, ...substitutions: string[]): void {
        this.announcement = {
            text: this.translations.get(key, ...substitutions),
            seq: this.announcement.seq + 1
        };
    }

    /** Removes a file without an object (rejected or invalid) from the list. */
    dismissFile(file: FileStore): void {
        if (file.canDismiss) {
            this.files = this.files.filter(f => f !== file);
        }
    }

    /** A file whose object is created and not uploaded yet can be uploaded. */
    canUploadFile(file: FileStore): boolean {
        return file.fileStatus === "pending";
    }

    /**
     * Uploads the content of one file into its uncommitted object. `saveDocument` also commits the object,
     * so no Save changes is needed.
     */
    uploadFile(file: FileStore): void {
        if (!this.canUploadFile(file)) {
            return;
        }
        file.setUploading();
        this._uploadQueue.push(file);
        this.processUploadQueue();
    }

    /** A file whose object is not committed yet can be removed. */
    canRemove(file: FileStore): boolean {
        return file.fileStatus === "pending" && !this.files.some(f => f.fileStatus === "removing");
    }

    /**
     * Removes a file whose object is not committed yet. With On remove configured, runs it with the file
     * object (expected: Delete object) and removes the file from the list once it has finished.
     * Without it, the file is only removed from the list: its object stays on the page and a later
     * Save changes commits it without contents.
     */
    async removeFile(file: FileStore): Promise<void> {
        if (!this.canRemove(file)) {
            return;
        }

        if (!this._removeAction) {
            console.warn(
                `'${this._widgetName}': 'On remove' is not configured. The removed file's object is still committed by Save changes.`
            );
            runInAction(() => {
                this.files = this.files.filter(f => f !== file);
            });
            return;
        }

        file.setRemoving();
        try {
            await this._removeRunner.run(this.itemActionFor(() => this._removeAction, file));
            runInAction(() => {
                this.files = this.files.filter(f => f !== file);
            });
        } catch (e: unknown) {
            console.error(
                `The 'On remove' action did not finish. Please check if '${this._widgetName}' widget is configured correctly.`,
                e
            );
            file.setPending();
            this.announce("uploadFailureGenericMessage");
        }
    }

    processDrop(acceptedFiles: File[], fileRejections: FileRejection[]): void {
        if (!this.canCreateFiles) {
            console.error(
                `Can't create new files: the user has no create access on the entity of the 'Files' data source, or the data source does not allow creating objects. Please check if '${this._widgetName}' widget is configured correctly.`
            );
            this.createActionFailed = true;
            return;
        }
        this.createActionFailed = false;

        // previous validation errors are replaced by the new drop
        this.files = this.files.filter(f => f.fileStatus !== "validationError");

        for (const rejection of fileRejections) {
            this.files.unshift(FileStore.newFileWithValidationError(rejection.file, this.describeRejection(rejection)));
        }

        const remaining =
            this.maxTotalFiles > 0 ? Math.max(0, this.maxTotalFiles - this.activeCount) : acceptedFiles.length;
        const withinLimit = acceptedFiles.slice(0, remaining);
        const overLimit = acceptedFiles.slice(remaining);

        for (const file of overLimit) {
            this.files.unshift(FileStore.newRejectedFile(file));
        }
        if (overLimit.length > 0) {
            this.announce("uploadLimitReachedMessage", this.maxTotalFiles.toString());
        }

        for (const file of withinLimit) {
            const fileStore = FileStore.newFile(file);
            this.files.unshift(fileStore);
            this.createObject(fileStore);
        }
    }

    /** Uploads the queued files one by one, then runs the On upload event. */
    private async processUploadQueue(): Promise<void> {
        if (this.isUploading) {
            return;
        }
        runInAction(() => {
            this.isUploading = true;
        });

        let failed = 0;
        let file: FileStore | undefined;
        while ((file = this._uploadQueue.shift())) {
            if (await file.uploadContent()) {
                this.executeItemEvent(file);
            } else {
                failed++;
            }
        }

        runInAction(() => {
            this.isUploading = false;
        });
        this.announce(failed > 0 ? "uploadFailureGenericMessage" : "uploadSuccessMessage");

        if (this._uploadAction?.canExecute) {
            this._uploadAction.execute();
        }
    }

    private executeItemEvent(file: FileStore): void {
        const itemAction = this.itemActionFor(() => this._uploadItemAction, file)();
        if (itemAction?.canExecute) {
            itemAction.execute();
        }
    }

    private async createObject(fileStore: FileStore): Promise<void> {
        const ds = this._datasource;
        try {
            if (!isCreatable(ds)) {
                throw new Error("The 'Files' data source does not allow creating objects.");
            }
            const item = await ds.create();
            fileStore.setCreated(item);
            if (UPLOAD_ON_CREATE) {
                this.uploadFile(fileStore);
            }
        } catch (e: unknown) {
            console.warn("Creating a file object has failed.", e);
            fileStore.setFailed();
            this.announce("uploadFailureGenericMessage");
        }
    }

    /**
     * The value of a linked action for the object of a file. Reads the latest props on every call.
     * `get()` may throw for an object the platform doesn't consider part of the datasource.
     */
    private itemActionFor(getListAction: () => ListActionValue | undefined, file: FileStore): ActionGetter {
        return () => {
            const listAction = getListAction();
            const item = file.objectItem;
            if (!listAction || !item) {
                return undefined;
            }
            try {
                return listAction.get(item);
            } catch (e: unknown) {
                console.warn(`Can't get the action for ${item.id}.`, e);
                return undefined;
            }
        };
    }

    private describeRejection(rejection: FileRejection): string {
        return rejection.errors
            .map(e => {
                if (e.code === "file-invalid-type") {
                    return this.translations.get(
                        "uploadFailureInvalidFileFormatMessage",
                        this.allowedFormatsDescription
                    );
                }
                if (e.code === "file-too-large") {
                    return this.translations.get("uploadFailureFileIsTooBigMessage", this._maxFileSizeMiB.toString());
                }
                return e.message;
            })
            .join(" ");
    }
}
