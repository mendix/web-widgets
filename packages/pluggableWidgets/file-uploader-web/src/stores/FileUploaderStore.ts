import { Big } from "big.js";
import { DynamicValue, ObjectItem } from "mendix";
import { action, comparer, computed, makeObservable, observable, reaction } from "mobx";
import { FileRejection } from "react-dropzone";
import { FileStore } from "./FileStore";
import { TranslationsStore } from "./TranslationsStore";
import { FileUploaderContainerProps, UploadModeEnum } from "../../typings/FileUploaderProps";
import { DatasourceUpdateProcessor } from "../utils/DatasourceUpdateProcessor";
import { ObjectCreationHelper } from "../utils/ObjectCreationHelper";
import { getImageUploaderFormats, parseAllowedFormats } from "../utils/parseAllowedFormats";
import { FileCheckFormat } from "../utils/predefinedFormats";

export class FileUploaderStore {
    files: FileStore[] = [];
    lastSeenItems: Set<ObjectItem["id"]> = new Set<ObjectItem["id"]>();

    objectCreationHelper: ObjectCreationHelper;
    updateProcessor: DatasourceUpdateProcessor;

    existingItemsLoaded = false;
    isReadOnly: boolean;

    acceptedFileTypes: FileCheckFormat[];

    private _widgetName: string;
    private _uploadMode: UploadModeEnum;
    private _maxFileSizeMiB = 0;
    private _maxFileSize = 0;
    private _maxTotalFiles: DynamicValue<Big> | undefined;
    private _maxConcurrentUploads: DynamicValue<Big> | undefined;
    private _disposePromoteReaction: (() => void) | undefined;

    createActionFailed = false;

    private translations: TranslationsStore;

    constructor(props: FileUploaderContainerProps, translations: TranslationsStore) {
        this._widgetName = props.name;
        this._maxFileSizeMiB = props.maxFileSize;
        this._maxFileSize = this._maxFileSizeMiB * 1024 * 1024;
        this._maxTotalFiles = props.maxFilesPerUpload;
        this._maxConcurrentUploads = props.maxFilesPerBatch;
        this._uploadMode = props.uploadMode;

        this.objectCreationHelper = new ObjectCreationHelper(this._widgetName, props.objectCreationTimeout);
        this.updateProcessor = new DatasourceUpdateProcessor({
            loaded: () => {
                this.objectCreationHelper.enable();
            },
            processNew: (newItem: ObjectItem) => {
                this.objectCreationHelper.processEmptyObjectItem(newItem);
            },
            processExisting: (existingItem: ObjectItem) => {
                this.processExistingFileItem(existingItem);
            },
            processMissing: (missingItem: ObjectItem) => {
                const missingFile = this.files.find(f => {
                    return f.objectItemId === missingItem.id;
                });

                if (!missingFile) {
                    console.warn(`Object ${missingItem.id} is not found in file stores.`);
                    return;
                }

                missingFile?.markMissing();
            }
        });

        this.isReadOnly = props.readOnlyMode;

        this.acceptedFileTypes =
            this._uploadMode === "files" ? parseAllowedFormats(props.allowedFileFormats) : getImageUploaderFormats();

        this.translations = translations;

        makeObservable<this, "_maxTotalFiles" | "_maxConcurrentUploads">(this, {
            updateProps: action,
            processDrop: action,
            dismissFile: action,
            setCreateActionFailed: action,
            promoteQueuedFiles: action,
            processExistingFileItem: action,
            files: observable,
            existingItemsLoaded: observable,
            createActionFailed: observable,
            allowedFormatsDescription: computed,
            maxFileSize: computed,
            maxTotalFiles: computed,
            maxConcurrentUploads: computed,
            _maxTotalFiles: observable,
            _maxConcurrentUploads: observable,
            isFileUploadLimitReached: computed,
            hasValidationErrors: computed,
            sortedFiles: computed,
            activeCount: computed,
            uploadingCount: computed,
            queuedCount: computed
        });

        this.updateProps(props);

        this._disposePromoteReaction = reaction(
            () => ({ uploading: this.uploadingCount, queued: this.queuedCount }),
            ({ uploading, queued }, prev) => {
                if (uploading < prev.uploading || queued > prev.queued) {
                    this.promoteQueuedFiles();
                }
            },
            { equals: comparer.structural }
        );
    }

    updateProps(props: FileUploaderContainerProps): void {
        this.objectCreationHelper.updateProps(props);

        this._maxTotalFiles = props.maxFilesPerUpload;
        this._maxConcurrentUploads = props.maxFilesPerBatch;

        this.translations.updateProps(props);
        this.updateProcessor.processUpdate(
            props.uploadMode === "files" ? props.associatedFiles : props.associatedImages
        );
    }

    processExistingFileItem(item: ObjectItem): void {
        this.files.unshift(FileStore.existingFile(item, this));

        this.lastSeenItems.add(item.id);
    }

    get allowedFormatsDescription(): string {
        return this.acceptedFileTypes
            .map(f => {
                return f.description;
            })
            .filter(_ => _)
            .join(", ");
    }

    get maxFileSize(): number {
        return this._maxFileSize;
    }

    get uploadMode(): UploadModeEnum {
        return this._uploadMode;
    }

    get maxTotalFiles(): number {
        const expressionValue = this._maxTotalFiles?.value;
        if (expressionValue) {
            return expressionValue.toNumber();
        }
        return 0;
    }

    get maxConcurrentUploads(): number {
        const expressionValue = this._maxConcurrentUploads?.value;
        if (expressionValue) {
            return expressionValue.toNumber();
        }
        return 0;
    }

    get activeCount(): number {
        return this.files.filter(
            f =>
                f.fileStatus !== "missing" &&
                f.fileStatus !== "removedFile" &&
                f.fileStatus !== "validationError" &&
                f.fileStatus !== "rejected" &&
                f.fileStatus !== "uploadingError"
        ).length;
    }

    get uploadingCount(): number {
        return this.files.filter(f => f.fileStatus === "uploading").length;
    }

    get queuedCount(): number {
        return this.files.filter(f => f.fileStatus === "queued").length;
    }

    get isFileUploadLimitReached(): boolean {
        if (this.maxTotalFiles === 0) {
            return false;
        }

        return this.activeCount >= this.maxTotalFiles;
    }

    get hasValidationErrors(): boolean {
        return this.files.some(f => f.fileStatus === "validationError");
    }

    get sortedFiles(): FileStore[] {
        return [...this.files].sort((a, b) => {
            const isErrorA = a.fileStatus === "validationError" || a.fileStatus === "rejected" ? 1 : 0;
            const isErrorB = b.fileStatus === "validationError" || b.fileStatus === "rejected" ? 1 : 0;
            return isErrorA - isErrorB;
        });
    }

    setCreateActionFailed(failed: boolean): void {
        this.createActionFailed = failed;
    }

    private dismissValidationErrors(): void {
        this.files = this.files.filter(f => f.fileStatus !== "validationError");
    }

    dismissFile(file: FileStore): void {
        this.files = this.files.filter(f => f !== file);
    }

    promoteQueuedFiles(): void {
        const concurrentLimit = this.maxConcurrentUploads;
        const availableSlots =
            concurrentLimit > 0 ? Math.max(0, concurrentLimit - this.uploadingCount) : Number.MAX_SAFE_INTEGER;

        if (availableSlots === 0) {
            return;
        }

        // oldest first: last in array = oldest
        const queued = [...this.files].filter(f => f.fileStatus === "queued").reverse();

        for (let i = 0; i < Math.min(availableSlots, queued.length); i++) {
            queued[i].upload();
        }
    }

    dispose(): void {
        this._disposePromoteReaction?.();
    }

    processDrop(acceptedFiles: File[], fileRejections: FileRejection[]): void {
        if (!this.objectCreationHelper.canCreateFiles) {
            console.error(
                `'Action to create new files/images' is not available or can't be executed. Please check if '${this._widgetName}' widget is configured correctly.`
            );
            this.setCreateActionFailed(true);
            return;
        }

        this.setCreateActionFailed(false);
        this.dismissValidationErrors();

        const activeCount = this.activeCount;
        const remaining = this.maxTotalFiles > 0 ? Math.max(0, this.maxTotalFiles - activeCount) : acceptedFiles.length;
        const capacityFiles = acceptedFiles.slice(0, remaining);
        const capacityExcess = acceptedFiles.slice(remaining);

        for (const file of fileRejections) {
            const newFileStore = FileStore.newFileWithValidationError(
                file.file,
                file.errors
                    .map(e => {
                        if (e.code === "file-invalid-type") {
                            return this.translations.get(
                                "uploadFailureInvalidFileFormatMessage",
                                this.allowedFormatsDescription
                            );
                        }
                        if (e.code === "file-too-large") {
                            return this.translations.get(
                                "uploadFailureFileIsTooBigMessage",
                                this._maxFileSizeMiB.toString()
                            );
                        }
                        return e.message;
                    })
                    .join(" "),
                this
            );
            this.files.unshift(newFileStore);
        }

        for (const file of capacityExcess) {
            this.files.unshift(FileStore.newRejectedFile(file, this));
        }

        for (const file of capacityFiles) {
            const newFileStore = FileStore.newFile(file, this);
            this.files.unshift(newFileStore);
        }
    }
}
