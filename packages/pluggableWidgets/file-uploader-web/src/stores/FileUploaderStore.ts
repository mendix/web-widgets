import { ActionValue, ListValue, ObjectItem } from "mendix";
import { FileUploaderContainerProps, UploadModeEnum } from "../../typings/FileUploaderProps";
import { action, computed, makeObservable, observable } from "mobx";
import { getImageUploaderFormats, parseAllowedFormats } from "../utils/parseAllowedFormats";
import { FileStore } from "./FileStore";
import { fileHasContents } from "../utils/mx-data";
import { FileRejection } from "react-dropzone";
import { FileCheckFormat } from "../utils/predefinedFormats";
import { TranslationsStore } from "./TranslationsStore";

export class FileUploaderStore {
    files: FileStore[] = [];
    lastSeenItems: Set<ObjectItem["id"]> = new Set<ObjectItem["id"]>();
    currentWaiting: Array<(v: ObjectItem | undefined) => void> = [];
    itemCreationTimeout?: number = undefined;

    existingItemsLoaded = false;
    isReadOnly: boolean;

    acceptedFileTypes: FileCheckFormat[];

    _widgetName: string;
    _uploadMode: UploadModeEnum;
    _createObjectAction?: ActionValue;
    _maxFileSizeMb = 0;
    _maxFileSize = 0;
    _ds?: ListValue;
    _maxFilesPerUpload: number;
    _objectCreationTimeout: number;

    errorMessage?: string = undefined;

    translations: TranslationsStore;

    constructor(props: FileUploaderContainerProps, translations: TranslationsStore) {
        this._widgetName = props.name;
        this._maxFileSizeMb = props.maxFileSize;
        this._maxFileSize = this._maxFileSizeMb * 1024 * 1024;
        this._maxFilesPerUpload = props.maxFilesPerUpload;
        this._uploadMode = props.uploadMode;
        this._objectCreationTimeout = props.objectCreationTimeout;

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
            this._createObjectAction = props.createFileAction;
            this._ds = props.associatedFiles;
        } else {
            this._createObjectAction = props.createImageAction;
            this._ds = props.associatedImages;
        }

        this.translations.updateProps(props);

        const itemsDs = this._ds;
        if (!this.existingItemsLoaded) {
            if (itemsDs.status === "available" && itemsDs.items) {
                for (const item of itemsDs.items) {
                    this.processExistingFileItem(item);
                }

                this.existingItemsLoaded = true;
            }
        } else {
            for (const newItem of findNewItems(this.lastSeenItems, itemsDs.items || [])) {
                if (!fileHasContents(newItem)) {
                    this.processEmptyFileItem(newItem);
                } else {
                    // adding this file to the list as is as this file is not empty and probably created externally
                    this.processExistingFileItem(newItem);
                }
            }
        }
    }

    processExistingFileItem(item: ObjectItem): void {
        this.files.unshift(FileStore.existingFile(item, this));

        this.lastSeenItems.add(item.id);
    }

    processEmptyFileItem(item: ObjectItem): void {
        if (this.isReadOnly) {
            return;
        }
        const firstWaiting = this.currentWaiting.shift();
        if (firstWaiting) {
            firstWaiting(item);
        }

        this.lastSeenItems.add(item.id);

        this.executeFileObjectCreation();
    }

    get allowedFormatsDescription(): string {
        return this.acceptedFileTypes
            .map(f => {
                return f.description;
            })
            .filter(_ => _)
            .join(", ");
    }

    get canRequestFile(): boolean {
        return this.existingItemsLoaded && !!this._createObjectAction;
    }

    requestFileObject(): Promise<ObjectItem | undefined> {
        if (!this.canRequestFile) {
            throw new Error("Can't request file");
        }

        return new Promise<ObjectItem | undefined>(resolve => {
            this.currentWaiting.push(resolve);

            this.executeFileObjectCreation();
        });
    }

    executeFileObjectCreation(): void {
        clearTimeout(this.itemCreationTimeout);
        this.itemCreationTimeout = undefined;

        if (!this.currentWaiting.length) {
            return;
        }
        // we need to check if creation is taking too much time
        // start the timer to measure how long it takes,
        // if a threshold is reached, declare it a failure
        // this means the action is probably misconfigured.
        this.itemCreationTimeout = setTimeout(() => {
            console.error(
                `Looks like the 'Action to create new files/images' action did not create any objects within ${this._objectCreationTimeout} seconds. Please check if '${this._widgetName}' widget is configured correctly.`
            );
            // fail all waiting
            while (this.currentWaiting.length) {
                this.currentWaiting.shift()?.(undefined);
            }
        }, this._objectCreationTimeout * 1000) as any as number;

        this._createObjectAction!.execute();
    }

    setMessage(msg?: string): void {
        this.errorMessage = msg;
    }

    processDrop(acceptedFiles: File[], fileRejections: FileRejection[]): void {
        if (!this._createObjectAction || !this._createObjectAction.canExecute) {
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
                                this._maxFileSizeMb.toString()
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

function findNewItems(lastSeenItems: Set<ObjectItem["id"]>, currentItems: ObjectItem[]): ObjectItem[] {
    return currentItems.filter(i => !lastSeenItems.has(i.id));
}
