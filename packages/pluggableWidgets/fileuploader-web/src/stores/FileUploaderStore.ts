import { ActionValue, ListValue, ObjectItem } from "mendix";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { action, makeObservable, observable, runInAction } from "mobx";
import { MimeCheckFormat, parseAllowedFormats } from "../utils/allowedFormatChecker";
import { FileStore } from "./FileStore";
import { extractMxObject } from "../utils/mx-data";
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
                    this.files.push(FileStore.existingFile(item, this));

                    this.lastSeenItems.add(item.id);
                }

                this.existingItemsLoaded = true;
            }
        } else {
            // todo: re-check that existing items are still there
            const newItems = findNewItems(this.lastSeenItems, itemsDs.items || []);
            if (newItems) {
                for (const newItem of newItems) {
                    const obj = extractMxObject(newItem);
                    if (!obj.get2("HasContents")) {
                        // todo resolve waiting
                        const firstWaiting = this.currentWaiting.shift();
                        if (firstWaiting) {
                            firstWaiting(newItem);
                        }
                    } else {
                        // adding this file as file possibly created by someone else
                        this.files.push(FileStore.existingFile(newItem, this));
                    }

                    this.lastSeenItems.add(newItem.id);
                }
            }
        }
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

    async processDrop(acceptedFiles: File[], fileRejections: FileRejection[]): Promise<void> {
        if (!this._createFileAction || !this._createFileAction.canExecute) {
            console.warn(
                `'Action to create new files' is not available or can't be executed. Please check if '${this._widgetName}' widget is configured correctly.`
            );
            runInAction(() => {
                this.errorMessage = "Can't upload files at this time. Please contact you system administrator.";
            });
            return;
        }

        if (fileRejections.length && fileRejections[0].errors[0].code === "too-many-files") {
            runInAction(() => {
                this.errorMessage =
                    "Too many files added. " +
                    (this._maxFilesPerUpload === 1
                        ? `Only one files per upload is allowed.`
                        : `Only ${this._maxFilesPerUpload} files per upload are allowed.`);
            });
            return;
        }

        runInAction(() => {
            this.errorMessage = undefined;
        });

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

function findNewItems(lastSeenItems: Set<ObjectItem["id"]>, currentItems: ObjectItem[]): ObjectItem[] | undefined {
    const notSeenItems = currentItems.filter(i => !lastSeenItems.has(i.id));
    if (!notSeenItems.length) {
        return undefined;
    }

    return notSeenItems;
}
