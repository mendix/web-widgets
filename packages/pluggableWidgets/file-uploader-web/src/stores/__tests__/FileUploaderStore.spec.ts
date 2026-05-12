import { Big } from "big.js";
import { DynamicValue } from "mendix";
import { actionValue, dynamic, ListValueBuilder, obj } from "@mendix/widget-plugin-test-utils";
import { FileUploaderContainerProps } from "../../../typings/FileUploaderProps";
import { FileStore } from "../FileStore";
import { FileUploaderStore } from "../FileUploaderStore";
import { TranslationsStore } from "../TranslationsStore";

jest.mock("../../utils/mx-data", () => ({
    fetchDocumentUrl: jest.fn(),
    fetchImageThumbnail: jest.fn(),
    fetchMxObject: jest.fn(),
    removeObject: jest.fn(),
    saveFile: jest.fn(),
    fileHasContents: jest.fn()
}));

function unavailableDynamic(): DynamicValue<Big> {
    return { status: "unavailable", value: undefined } as unknown as DynamicValue<Big>;
}

function buildProps(overrides: Partial<FileUploaderContainerProps> = {}): FileUploaderContainerProps {
    return {
        name: "fileUploader1",
        class: "",
        style: undefined,
        tabIndex: 0,
        uploadMode: "files",
        associatedFiles: new ListValueBuilder().withItems([]).build(),
        associatedImages: new ListValueBuilder().withItems([]).build(),
        readOnlyMode: false,
        createFileAction: actionValue(true, false),
        createImageAction: actionValue(true, false),
        allowedFileFormats: [],
        maxFilesPerUpload: dynamic(new Big(2)),
        maxFilesPerBatch: unavailableDynamic(),
        maxFileSize: 25,
        objectCreationTimeout: 10,
        dropzoneIdleMessage: dynamic("Drag and drop files here"),
        dropzoneAcceptedMessage: dynamic("All files can be uploaded."),
        dropzoneRejectedMessage: dynamic("Some files may not be uploadable."),
        uploadInProgressMessage: dynamic("Uploading..."),
        uploadSuccessMessage: dynamic("Uploaded successfully."),
        uploadFailureGenericMessage: dynamic("An error occurred during uploading."),
        uploadFailureInvalidFileFormatMessage: dynamic("File format is not supported, supported formats are ###."),
        uploadFailureFileIsTooBigMessage: dynamic("File size exceeds the maximum limit of ### megabytes."),
        uploadFailureTooManyFilesMessage: dynamic("Too many files added. Only ### files per upload are allowed."),
        uploadLimitReachedMessage: dynamic("Maximum file count of ### reached."),
        uploadBatchLimitExceededMessage: dynamic("File not uploaded. Batch limit of ### files per drop was reached."),
        unavailableCreateActionMessage: dynamic(
            "Can't upload files at this time. Please contact your system administrator."
        ),
        downloadButtonTextMessage: dynamic("Download this file"),
        removeButtonTextMessage: dynamic("Remove this file"),
        removeSuccessMessage: dynamic("Removed successfully."),
        removeErrorMessage: dynamic("An error occurred while removing this file."),
        enableCustomButtons: false,
        customButtons: [],
        onUploadSuccessFile: undefined,
        onUploadSuccessImage: undefined,
        onUploadFailureFile: undefined,
        onUploadFailureImage: undefined,
        ...overrides
    };
}

function buildStore(overrides: Partial<FileUploaderContainerProps> = {}): FileUploaderStore {
    const props = buildProps(overrides);
    const translations = new TranslationsStore(props);
    return new FileUploaderStore(props, translations);
}

function makeStore(): FileUploaderStore {
    const translations = { get: jest.fn(() => "msg"), updateProps: jest.fn() } as unknown as TranslationsStore;
    const store = Object.create(FileUploaderStore.prototype) as FileUploaderStore;
    store.files = [];
    return Object.assign(store, {
        translations,
        objectCreationHelper: { canCreateFiles: true, enable: jest.fn(), updateProps: jest.fn(), request: jest.fn() },
        updateProcessor: { processUpdate: jest.fn() },
        isReadOnly: false,
        _uploadMode: "files" as const,
        _maxFileSizeMiB: 10,
        _maxFileSize: 10 * 1024 * 1024,
        acceptedFileTypes: [],
        existingItemsLoaded: false
    });
}

function makeValidationErrorFile(store: FileUploaderStore): FileStore {
    return FileStore.newFileWithError(new File([], "bad.txt"), "bad format", store);
}

function makeDoneFile(store: FileUploaderStore): FileStore {
    const f = FileStore.newFile(new File([], "good.txt"), store);
    (f as any).fileStatus = "done";
    return f;
}

describe("FileUploaderStore.dismissFile()", () => {
    it("removes the specific file from the list", () => {
        const store = makeStore();
        const fileA = makeValidationErrorFile(store);
        const fileB = makeValidationErrorFile(store);
        store.files = [fileA, fileB];

        store.dismissFile(fileA);

        expect(store.files).toHaveLength(1);
        expect(store.files[0]).toBe(fileB);
    });

    it("does not remove other files", () => {
        const store = makeStore();
        const fileA = makeValidationErrorFile(store);
        const fileB = makeDoneFile(store);
        store.files = [fileA, fileB];

        store.dismissFile(fileA);

        expect(store.files[0]).toBe(fileB);
    });

    it("is a no-op when file is not in the list", () => {
        const store = makeStore();
        store.errorMessage = "Some files may not be uploadable.";
        const fileA = makeValidationErrorFile(store);
        const fileB = makeValidationErrorFile(store);
        store.files = [fileA];

        store.dismissFile(fileB);

        expect(store.files).toHaveLength(1);
        expect(store.files[0]).toBe(fileA);
        expect(store.errorMessage).toBe("Some files may not be uploadable.");
    });

    it("clears errorMessage when last validationError file is dismissed", () => {
        const store = makeStore();
        store.errorMessage = "Some files may not be uploadable.";
        const file = makeValidationErrorFile(store);
        store.files = [file];

        store.dismissFile(file);

        expect(store.errorMessage).toBeUndefined();
    });

    it("keeps errorMessage while other validationError files remain", () => {
        const store = makeStore();
        store.errorMessage = "Some files may not be uploadable.";
        const fileA = makeValidationErrorFile(store);
        const fileB = makeValidationErrorFile(store);
        store.files = [fileA, fileB];

        store.dismissFile(fileA);

        expect(store.errorMessage).toBe("Some files may not be uploadable.");
    });
});

describe("FileUploaderStore.processDrop() errorMessage", () => {
    it("sets errorMessage when file rejections exist", () => {
        const store = makeStore();
        const rejection = { file: new File([], "bad.xlsx"), errors: [{ code: "file-invalid-type", message: "bad" }] };

        store.processDrop([], [rejection]);

        expect(store.errorMessage).toBe("msg");
    });

    it("clears errorMessage when no rejections", () => {
        const store = makeStore();
        store.errorMessage = "Some files may not be uploadable.";

        store.processDrop([], []);

        expect(store.errorMessage).toBeUndefined();
    });
});

describe("FileUploaderStore.warningMessage", () => {
    test("returns undefined when no limit set and no error", () => {
        const store = buildStore({ maxFilesPerUpload: unavailableDynamic() });
        expect(store.warningMessage).toBeUndefined();
    });

    test("returns undefined when under limit and no error", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(5)) });
        expect(store.warningMessage).toBeUndefined();
    });

    test("returns limit-reached message when file limit is reached", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        store.files.push(
            { fileStatus: "existingFile", _objectItem: obj("a") } as any,
            { fileStatus: "existingFile", _objectItem: obj("b") } as any
        );

        expect(store.isFileUploadLimitReached).toBe(true);
        expect(store.warningMessage).toBe("Maximum file count of 2 reached.");
    });

    test("returns errorMessage when limit not reached but error set", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(5)) });
        store.setMessage("Some other error");

        expect(store.warningMessage).toBe("Some other error");
    });

    test("clears limit-reached message when file removed below limit", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        const fileA = { fileStatus: "existingFile", _objectItem: obj("a") } as any;
        const fileB = { fileStatus: "existingFile", _objectItem: obj("b") } as any;
        store.files.push(fileA, fileB);

        expect(store.warningMessage).toBe("Maximum file count of 2 reached.");

        store.files.splice(store.files.indexOf(fileA), 1);

        expect(store.isFileUploadLimitReached).toBe(false);
        expect(store.warningMessage).toBeUndefined();
    });
});

describe("FileUploaderStore.isFileUploadLimitReached", () => {
    test("returns false when maxFilesPerUpload is 0 (unlimited)", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(0)) });

        store.files.push(
            { fileStatus: "existingFile" } as any,
            { fileStatus: "existingFile" } as any,
            { fileStatus: "existingFile" } as any
        );

        expect(store.isFileUploadLimitReached).toBe(false);
    });

    test("returns false when maxFilesPerUpload expression is unavailable (unlimited fallback)", () => {
        const store = buildStore({ maxFilesPerUpload: unavailableDynamic() });

        store.files.push({ fileStatus: "existingFile" } as any);

        expect(store.isFileUploadLimitReached).toBe(false);
    });

    test("excludes missing, removedFile, and validationError from active count", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        store.files.push(
            { fileStatus: "existingFile" } as any,
            { fileStatus: "missing" } as any,
            { fileStatus: "removedFile" } as any,
            { fileStatus: "validationError" } as any
        );

        expect(store.isFileUploadLimitReached).toBe(false);
    });
});

describe("FileUploaderStore.processDrop — capacity split", () => {
    function makeFile(name: string): File {
        return new File([""], name, { type: "text/plain" });
    }

    test("dismissValidationErrors preserves batchExceeded files", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(5)) });

        store.files.push(
            { fileStatus: "validationError", errorType: "validation" } as any,
            { fileStatus: "validationError", errorType: "batchExceeded" } as any
        );

        store.dismissValidationErrors();

        expect(store.files).toHaveLength(1);
        expect(store.files[0].errorType).toBe("batchExceeded");
    });

    test("dismissValidationErrors clears format errors but preserves limitExceeded files", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(5)) });

        store.files.push(
            { fileStatus: "validationError", errorType: "validation" } as any,
            { fileStatus: "validationError", errorType: "limitExceeded" } as any
        );

        store.dismissValidationErrors();

        expect(store.files).toHaveLength(1);
        expect(store.files[0].errorType).toBe("limitExceeded");
    });

    test("removing an active file promotes newest limitExceeded file to upload", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        const activeA = { fileStatus: "existingFile", errorType: undefined } as any;
        const activeB = { fileStatus: "existingFile", errorType: undefined } as any;
        // waitingNew is first in array (unshifted last = newest at top)
        const waitingNew = {
            fileStatus: "validationError",
            errorType: "limitExceeded",
            _file: makeFile("new.txt"),
            reset: jest.fn(),
            validate: () => true,
            upload: jest.fn()
        } as any;
        const waitingOld = {
            fileStatus: "validationError",
            errorType: "limitExceeded",
            _file: makeFile("old.txt"),
            reset: jest.fn(),
            validate: () => true,
            upload: jest.fn()
        } as any;

        store.files.push(waitingNew, waitingOld, activeA, activeB);

        store.files.splice(store.files.indexOf(activeA), 1);

        expect(waitingNew.upload).toHaveBeenCalledTimes(1);
        expect(waitingOld.upload).not.toHaveBeenCalled();
    });

    test("accepts files up to remaining capacity and marks overflow as limitExceeded", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(5)) });

        const files = [1, 2, 3, 4, 5, 6].map(n => makeFile(`file${n}.txt`));
        store.processDrop(files, []);

        const errorFiles = store.files.filter(f => f.fileStatus === "validationError");
        const acceptedFiles = store.files.filter(f => f.fileStatus !== "validationError");

        expect(errorFiles).toHaveLength(1);
        expect(errorFiles[0].errorType).toBe("limitExceeded");
        expect(acceptedFiles).toHaveLength(5);
    });

    test("retryLimitExceededFiles promotes batchExceeded files when slots open", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        const active = { fileStatus: "existingFile", errorType: undefined } as any;
        const waiting = {
            fileStatus: "validationError",
            errorType: "batchExceeded",
            reset: jest.fn(),
            validate: () => true,
            upload: jest.fn()
        } as any;

        store.files.push(waiting, active, { fileStatus: "existingFile" } as any);

        store.files.splice(store.files.indexOf(active), 1);

        expect(waiting.upload).toHaveBeenCalledTimes(1);
    });

    test("marks batch-excess files with errorType batchExceeded", () => {
        const store = buildStore({
            maxFilesPerUpload: unavailableDynamic(),
            maxFilesPerBatch: dynamic(new Big(2))
        });

        const files = [1, 2, 3, 4].map(n => makeFile(`file${n}.txt`));
        store.processDrop(files, []);

        const batchErrorFiles = store.files.filter(f => f.errorType === "batchExceeded");
        expect(batchErrorFiles).toHaveLength(2);
    });
});
