import { ActionValue, ListValue, ObjectItem } from "mendix";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { action, makeObservable, observable } from "mobx";
import { MimeCheckFormat, parseAllowedFormats } from "../utils/parseAllowedFormats";
import { FileStore } from "./FileStore";
import { fileHasContents } from "../utils/mx-data";
import { FileRejection } from "react-dropzone";

export class FileUploaderStore {
    files: FileStore[] = [];
    lastSeenItems: Set<ObjectItem["id"]> = new Set<ObjectItem["id"]>();
    currentWaiting: Array<(v: ObjectItem) => void> = [];

    existingItemsLoaded = false;

    acceptedFileTypes: MimeCheckFormat;

    _widgetName: string;
    _createFileAction?: ActionValue;
    _maxFileSize = 0;
    _ds?: ListValue;
    _maxFilesPerUpload: number;

    errorMessage?: string = undefined;

    constructor(props: FileUploaderContainerProps) {
        this._widgetName = props.name;
        this._maxFileSize = props.maxFileSize * 1024 * 1024;
        this._maxFilesPerUpload = props.maxFilesPerUpload;

        this.acceptedFileTypes = parseAllowedFormats(props.allowedFileFormats);

        makeObservable(this, {
            updateProps: action,
            processDrop: action,
            setMessage: action,
            processExistingFileItem: action,
            files: observable,
            existingItemsLoaded: observable,
            errorMessage: observable
        });

        this.updateProps(props);
    }

    updateProps(props: FileUploaderContainerProps): void {
        this._createFileAction = props.createFileAction;
        this._ds = props.associatedFiles;

        const itemsDs = props.associatedFiles;
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
                    // adding this file as file is not empty and created externally
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
        const firstWaiting = this.currentWaiting.shift();
        if (firstWaiting) {
            firstWaiting(item);
        }

        this.lastSeenItems.add(item.id);
    }

    get canRequestFile(): boolean {
        return this.existingItemsLoaded && !!this._createFileAction;
    }

    requestFileObject(): Promise<ObjectItem> {
        if (!this.canRequestFile) {
            throw new Error("Can't request file");
        }

        return new Promise<ObjectItem>(resolve => {
            this._createFileAction!.execute();

            this.currentWaiting.push(resolve);
        });
    }

    setMessage(msg?: string): void {
        this.errorMessage = msg;
    }

    async processDrop(acceptedFiles: File[], fileRejections: FileRejection[]): Promise<void> {
        if (!this._createFileAction || !this._createFileAction.canExecute) {
            console.error(
                `'Action to create new files' is not available or can't be executed. Please check if '${this._widgetName}' widget is configured correctly.`
            );
            this.setMessage("Can't upload files at this time. Please contact you system administrator.");
            return;
        }

        if (fileRejections.length && fileRejections[0].errors[0].code === "too-many-files") {
            this.setMessage(
                "Too many files added. " +
                    (this._maxFilesPerUpload === 1
                        ? `Only one files per upload is allowed.`
                        : `Only ${this._maxFilesPerUpload} files per upload are allowed.`)
            );
            return;
        }

        this.setMessage();

        for (const file of fileRejections) {
            const newFileStore = FileStore.newFileWithError(
                file.file,
                file.errors.map(e => e.message).join(". ") + ".",
                this
            );

            this.files.unshift(newFileStore);
        }

        for (const file of acceptedFiles) {
            const newFileStore = FileStore.newFile(file, this);

            this.files.unshift(newFileStore);

            if (newFileStore.validate()) {
                await newFileStore.upload();
            }
        }
    }
}

function findNewItems(lastSeenItems: Set<ObjectItem["id"]>, currentItems: ObjectItem[]): ObjectItem[] {
    return currentItems.filter(i => !lastSeenItems.has(i.id));
}
