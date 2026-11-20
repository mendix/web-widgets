import { Big } from "big.js";
import { ActionValue, DynamicValue, ListActionValue, ListValue } from "mendix";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { FileRejection } from "react-dropzone";
import { FileStore } from "./FileStore";
import { TranslationsStore } from "./TranslationsStore";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { ActionGetter, ActionRunner } from "../utils/ActionRunner";
import { canCreate, isCreatable } from "../utils/creatableListValue";
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
    private _actionRunner: ActionRunner;
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
        this._actionRunner = new ActionRunner(props.uploadActionTimeout);
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
            canUpload: computed,
            isUploadPerFile: computed,
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
        this._actionRunner.update();
    }

    dispose(): void {
        this._actionRunner.dispose();
    }

    get canCreateFiles(): boolean {
        return canCreate(this._datasource);
    }

    /** Experimental: the On upload (per file) action is configured and replaces the On upload action. */
    get isUploadPerFile(): boolean {
        return !!this._uploadItemAction;
    }

    get canUpload(): boolean {
        if (this.isUploading || this.files.some(f => f.fileStatus === "creating" || f.fileStatus === "removing")) {
            return false;
        }
        const pending = this.files.filter(f => f.fileStatus === "pending");
        if (pending.length === 0) {
            return false;
        }
        if (this.isUploadPerFile) {
            return pending.some(f => !!this.uploadItemActionFor(f)()?.canExecute);
        }
        return !!this._uploadAction?.canExecute;
    }

    /** Experimental: a pending file can be removed with the On remove action. */
    canRemove(file: FileStore): boolean {
        return (
            !!this._removeAction &&
            file.fileStatus === "pending" &&
            !this.isUploading &&
            !this.files.some(f => f.fileStatus === "removing")
        );
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

    dismissFile(file: FileStore): void {
        if (file.canDismiss) {
            this.files = this.files.filter(f => f !== file);
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

    /**
     * Experimental: runs the On remove action for one pending file and removes it from the list once
     * the action has finished. The action is expected to delete or roll back the object.
     */
    async removeFile(file: FileStore): Promise<void> {
        if (!this.canRemove(file)) {
            return;
        }

        file.setRemoving();
        try {
            await this._actionRunner.run(this.itemActionFor(() => this._removeAction, file));
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

    /** Uploads every pending file: commits the objects with the configured action, then uploads the contents. */
    async upload(): Promise<void> {
        if (!this.canUpload) {
            return;
        }

        const toUpload = this.files.filter(f => f.fileStatus === "pending");
        runInAction(() => {
            this.isUploading = true;
            toUpload.forEach(f => f.setUploading());
        });

        const failed = this.isUploadPerFile ? await this.uploadPerFile(toUpload) : await this.uploadBatch(toUpload);

        runInAction(() => {
            this.isUploading = false;
        });
        this.announce(failed > 0 ? "uploadFailureGenericMessage" : "uploadSuccessMessage");
    }

    /** Runs the On upload action once, then uploads the content of every file. Returns the number of failed files. */
    private async uploadBatch(toUpload: FileStore[]): Promise<number> {
        try {
            await this._actionRunner.run(() => this._uploadAction);
        } catch (e: unknown) {
            console.error(
                `The 'On upload' action did not finish. Please check if '${this._widgetName}' widget is configured correctly.`,
                e
            );
            runInAction(() => toUpload.forEach(f => f.setFailed()));
            return toUpload.length;
        }

        let failed = 0;
        for (const file of toUpload) {
            if (!(await file.uploadContent())) {
                failed++;
            }
        }
        return failed;
    }

    /**
     * Experimental: for every file, runs the On upload (per file) action with the file object, then uploads
     * its content. Returns the number of failed files.
     */
    private async uploadPerFile(toUpload: FileStore[]): Promise<number> {
        let failed = 0;
        for (const file of toUpload) {
            try {
                await this._actionRunner.run(this.uploadItemActionFor(file));
            } catch (e: unknown) {
                console.error(
                    `The 'On upload (per file)' action did not finish for ${file.objectItemId}. Please check if '${this._widgetName}' widget is configured correctly.`,
                    e
                );
                file.setFailed();
                failed++;
                continue;
            }
            if (!(await file.uploadContent())) {
                failed++;
            }
        }
        return failed;
    }

    private uploadItemActionFor(file: FileStore): ActionGetter {
        return this.itemActionFor(() => this._uploadItemAction, file);
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

    private async createObject(fileStore: FileStore): Promise<void> {
        const ds = this._datasource;
        try {
            if (!isCreatable(ds)) {
                throw new Error("The 'Files' data source does not allow creating objects.");
            }
            const item = await ds.create();
            fileStore.setCreated(item);
        } catch (e: unknown) {
            console.warn("Creating a file object has failed.", e);
            fileStore.setFailed();
            this.announce("uploadFailureGenericMessage");
        }
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
