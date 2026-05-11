import { Big } from "big.js";
import { DynamicValue, ObjectItem } from "mendix";
import { action, computed, makeObservable, observable } from "mobx";
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
            warningMessage: computed
        });

        this.updateProps(props);
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

    get warningMessage(): string | undefined {
        if (this.isFileUploadLimitReached) {
            return this.translations.get("uploadLimitReachedMessage", this.maxFilesPerUpload.toString());
        }
        return this.errorMessage;
    }

    setMessage(msg?: string): void {
        this.errorMessage = msg;
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

        const batchLimit = this.maxFilesPerBatch;
        const filesToProcess =
            batchLimit > 0 && acceptedFiles.length > batchLimit ? acceptedFiles.slice(0, batchLimit) : acceptedFiles;
        const batchExcess = batchLimit > 0 && acceptedFiles.length > batchLimit ? acceptedFiles.slice(batchLimit) : [];

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
                this
            );
            this.files.unshift(newFileStore);
        }

        for (const file of filesToProcess) {
            const newFileStore = FileStore.newFile(file, this);

            if (this.isFileUploadLimitReached) {
                newFileStore.markError(
                    this.translations.get("uploadFailureTooManyFilesMessage", this.maxFilesPerUpload.toString())
                );
            }

            this.files.unshift(newFileStore);

            if (newFileStore.validate()) {
                newFileStore.upload();
            }
        }
    }
}
