import { Big } from "big.js";
import { DynamicValue, ObjectItem } from "mendix";
import { action, computed, makeObservable, observable, reaction } from "mobx";
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

    _widgetName: string;
    _uploadMode: UploadModeEnum;
    _maxFileSizeMiB = 0;
    _maxFileSize = 0;
    _maxFilesPerUpload: DynamicValue<Big> | undefined;
    _maxFilesPerBatch: DynamicValue<Big> | undefined;
    _disposeRetryReaction: (() => void) | undefined;

    errorMessage?: string = undefined;

    translations: TranslationsStore;

    constructor(props: FileUploaderContainerProps, translations: TranslationsStore) {
        this._widgetName = props.name;
        this._maxFileSizeMiB = props.maxFileSize;
        this._maxFileSize = this._maxFileSizeMiB * 1024 * 1024;
        this._maxFilesPerUpload = props.maxFilesPerUpload;
        this._maxFilesPerBatch = props.maxFilesPerBatch;
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
                    return f._objectItem?.id === missingItem.id;
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

        makeObservable(this, {
            updateProps: action,
            processDrop: action,
            setMessage: action,
            dismissValidationErrors: action,
            retryLimitExceededFiles: action,
            processExistingFileItem: action,
            files: observable,
            existingItemsLoaded: observable,
            errorMessage: observable,
            allowedFormatsDescription: computed,
            maxFilesPerUpload: computed,
            maxFilesPerBatch: computed,
            _maxFilesPerUpload: observable,
            _maxFilesPerBatch: observable,
            isFileUploadLimitReached: computed,
            warningMessage: computed,
            sortedFiles: computed
        });

        this.updateProps(props);

        this._disposeRetryReaction = reaction(
            () =>
                this.files.filter(
                    f =>
                        f.fileStatus !== "missing" &&
                        f.fileStatus !== "removedFile" &&
                        f.fileStatus !== "validationError"
                ).length,
            (count, prevCount) => {
                if (count < prevCount) {
                    this.retryLimitExceededFiles();
                }
            }
        );
    }

    updateProps(props: FileUploaderContainerProps): void {
        this.objectCreationHelper.updateProps(props);

        this._maxFilesPerUpload = props.maxFilesPerUpload;
        this._maxFilesPerBatch = props.maxFilesPerBatch;

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

    get maxFilesPerUpload(): number {
        const expressionValue = this._maxFilesPerUpload?.value;
        if (expressionValue) {
            return expressionValue.toNumber();
        }
        return 0;
    }

    get maxFilesPerBatch(): number {
        const expressionValue = this._maxFilesPerBatch?.value;
        if (expressionValue) {
            return expressionValue.toNumber();
        }
        return 0;
    }

    get isFileUploadLimitReached(): boolean {
        const activeFiles = this.files.filter(
            file =>
                file.fileStatus !== "missing" &&
                file.fileStatus !== "removedFile" &&
                file.fileStatus !== "validationError"
        );
        if (this.maxFilesPerUpload === 0) {
            return false;
        }

        return activeFiles.length >= this.maxFilesPerUpload;
    }

    get sortedFiles(): FileStore[] {
        return [...this.files].sort((a, b) => {
            const isErrorA = a.fileStatus === "validationError" ? 1 : 0;
            const isErrorB = b.fileStatus === "validationError" ? 1 : 0;
            return isErrorA - isErrorB;
        });
    }

    get warningMessage(): string | undefined {
        if (this.isFileUploadLimitReached) {
            return this.translations.get("uploadLimitReachedMessage", this.maxFilesPerUpload.toString());
        }
        return this.errorMessage;
    }

    setMessage(msg?: string): void {
        this.errorMessage = msg;
    }

    dismissValidationErrors(): void {
        this.files = this.files.filter(
            f =>
                f.fileStatus !== "validationError" || f.errorType === "limitExceeded" || f.errorType === "batchExceeded"
        );
    }

    retryLimitExceededFiles(): void {
        const activeCount = this.files.filter(
            f => f.fileStatus !== "missing" && f.fileStatus !== "removedFile" && f.fileStatus !== "validationError"
        ).length;
        const capacitySlots =
            this.maxFilesPerUpload > 0 ? Math.max(0, this.maxFilesPerUpload - activeCount) : Number.MAX_SAFE_INTEGER;
        const slots = this.maxFilesPerBatch > 0 ? Math.min(capacitySlots, this.maxFilesPerBatch) : capacitySlots;

        if (slots === 0) {
            return;
        }

        const waiting = [...this.files].filter(
            f =>
                f.fileStatus === "validationError" &&
                (f.errorType === "limitExceeded" || f.errorType === "batchExceeded")
        );

        for (let i = 0; i < Math.min(slots, waiting.length); i++) {
            const file = waiting[i];
            file.reset();
            if (file.validate()) {
                file.upload();
            }
        }
    }

    dispose(): void {
        this._disposeRetryReaction?.();
    }

    processDrop(acceptedFiles: File[], fileRejections: FileRejection[]): void {
        if (!this.objectCreationHelper.canCreateFiles) {
            console.error(
                `'Action to create new files/images' is not available or can't be executed. Please check if '${this._widgetName}' widget is configured correctly.`
            );
            this.setMessage(this.translations.get("unavailableCreateActionMessage"));
            return;
        }

        if (fileRejections.length && fileRejections[0].errors[0].code === "too-many-files") {
            this.setMessage(
                this.translations.get("uploadFailureTooManyFilesMessage", this.maxFilesPerUpload.toString())
            );
            return;
        }

        this.setMessage();

        // Split accepted files by batch limit first, then by remaining total capacity
        const batchLimit = this.maxFilesPerBatch;
        const afterBatchSplit =
            batchLimit > 0 && acceptedFiles.length > batchLimit ? acceptedFiles.slice(0, batchLimit) : acceptedFiles;
        const batchExcess = batchLimit > 0 && acceptedFiles.length > batchLimit ? acceptedFiles.slice(batchLimit) : [];

        const activeCount = this.files.filter(
            f => f.fileStatus !== "missing" && f.fileStatus !== "removedFile" && f.fileStatus !== "validationError"
        ).length;
        const remaining =
            this.maxFilesPerUpload > 0 ? Math.max(0, this.maxFilesPerUpload - activeCount) : afterBatchSplit.length;
        const capacityFiles = afterBatchSplit.slice(0, remaining);
        const capacityExcess = afterBatchSplit.slice(remaining);

        for (const file of fileRejections) {
            const newFileStore = FileStore.newFileWithError(
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

        for (const file of batchExcess) {
            const newFileStore = FileStore.newFileWithError(
                file,
                this.translations.get("uploadBatchLimitExceededMessage", batchLimit.toString()),
                this,
                "batchExceeded"
            );
            this.files.unshift(newFileStore);
        }

        for (const file of capacityExcess) {
            const newFileStore = FileStore.newFile(file, this);
            newFileStore.markError(
                this.translations.get("uploadLimitReachedMessage", this.maxFilesPerUpload.toString()),
                "limitExceeded"
            );
            this.files.unshift(newFileStore);
        }

        for (const file of capacityFiles) {
            const newFileStore = FileStore.newFile(file, this);
            this.files.unshift(newFileStore);
            if (newFileStore.validate()) {
                newFileStore.upload();
            }
        }
    }
}
