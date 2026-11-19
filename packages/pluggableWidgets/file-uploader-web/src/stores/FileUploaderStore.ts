import { Big } from "big.js";
import { ActionValue, DynamicValue, ListValue } from "mendix";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { FileRejection } from "react-dropzone";
import { FileStore } from "./FileStore";
import { TranslationsStore } from "./TranslationsStore";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { ActionRunner } from "../utils/ActionRunner";
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
    private _actionRunner: ActionRunner;
    private translations: TranslationsStore;

    constructor(props: FileUploaderContainerProps, translations: TranslationsStore) {
        this._widgetName = props.name;
        this._maxFileSizeMiB = props.maxFileSize;
        this._maxFileSize = this._maxFileSizeMiB * 1024 * 1024;
        this._maxTotalFiles = props.maxFilesPerUpload;
        this._datasource = props.files;
        this._uploadAction = props.uploadAction;
        this._actionRunner = new ActionRunner(props.uploadActionTimeout);
        this.acceptedFileTypes = parseAllowedFormats(props.allowedFileFormats);
        this.translations = translations;

        makeObservable<this, "_maxTotalFiles" | "_datasource" | "_uploadAction">(this, {
            files: observable,
            createActionFailed: observable,
            isUploading: observable,
            announcement: observable.ref,
            _maxTotalFiles: observable.ref,
            _datasource: observable.ref,
            _uploadAction: observable.ref,
            updateProps: action,
            processDrop: action,
            dismissFile: action,
            announce: action,
            canCreateFiles: computed,
            canUpload: computed,
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
        this.translations.updateProps(props);
        this._actionRunner.update(props.uploadAction);
    }

    dispose(): void {
        this._actionRunner.dispose();
    }

    get canCreateFiles(): boolean {
        return canCreate(this._datasource);
    }

    get canUpload(): boolean {
        return (
            !this.isUploading &&
            !!this._uploadAction?.canExecute &&
            this.files.some(f => f.fileStatus === "pending") &&
            !this.files.some(f => f.fileStatus === "creating")
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
            ["creating", "pending", "uploading", "done", "uploadingError"].includes(f.fileStatus)
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

    /** Runs the upload action once, then uploads the content of every pending file. */
    async upload(): Promise<void> {
        if (!this.canUpload) {
            return;
        }

        const toUpload = this.files.filter(f => f.fileStatus === "pending");
        runInAction(() => {
            this.isUploading = true;
            toUpload.forEach(f => f.setUploading());
        });

        try {
            await this._actionRunner.run(this._uploadAction);
        } catch (e: unknown) {
            console.error(
                `The 'On upload' action did not finish. Please check if '${this._widgetName}' widget is configured correctly.`,
                e
            );
            runInAction(() => {
                toUpload.forEach(f => f.setFailed());
                this.isUploading = false;
            });
            this.announce("uploadFailureGenericMessage");
            return;
        }

        let failed = 0;
        for (const file of toUpload) {
            if (!(await file.uploadContent())) {
                failed++;
            }
        }

        runInAction(() => {
            this.isUploading = false;
        });
        this.announce(failed > 0 ? "uploadFailureGenericMessage" : "uploadSuccessMessage");
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
