import { ListValue, ObjectItem } from "mendix";
import { FileUploaderContainerProps, UploadModeEnum } from "../../typings/FileUploaderProps";
import { action, computed, makeObservable, observable } from "mobx";
import { getImageUploaderFormats, parseAllowedFormats } from "../utils/parseAllowedFormats";
import { FileStore } from "./FileStore";
import { FileRejection } from "react-dropzone";
import { FileCheckFormat } from "../utils/predefinedFormats";
import { TranslationsStore } from "./TranslationsStore";
import { ObjectCreationHelper } from "../utils/ObjectCreationHelper";
import { DatasourceUpdateProcessor } from "../utils/DatasourceUpdateProcessor";

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
    _ds?: ListValue;
    _maxFilesPerUpload: number;

    errorMessage?: string = undefined;

    translations: TranslationsStore;

    constructor(props: FileUploaderContainerProps, translations: TranslationsStore) {
        this._widgetName = props.name;
        this._maxFileSizeMiB = props.maxFileSize;
        this._maxFileSize = this._maxFileSizeMiB * 1024 * 1024;
        this._maxFilesPerUpload = props.maxFilesPerUpload;
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
            allowedFormatsDescription: computed
        });

        this.updateProps(props);
    }

    updateProps(props: FileUploaderContainerProps): void {
        if (props.uploadMode === "files") {
            this.objectCreationHelper.updateProps(props.createFileAction);
            this._ds = props.associatedFiles;
        } else {
            this.objectCreationHelper.updateProps(props.createImageAction);
            this._ds = props.associatedImages;
        }

        this.translations.updateProps(props);
        this.updateProcessor.processUpdate(this._ds);
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
                this.translations.get("uploadFailureTooManyFilesMessage", this._maxFilesPerUpload.toString())
            );
            return;
        }

        this.setMessage();

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

        for (const file of acceptedFiles) {
            const newFileStore = FileStore.newFile(file, this);

            this.files.unshift(newFileStore);

            if (newFileStore.validate()) {
                newFileStore.upload();
            }
        }
    }
}
