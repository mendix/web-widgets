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
        maxFilesPerUpload: dynamic(new Big(5)),
        maxFilesPerBatch: unavailableDynamic(),
        maxFileSize: 25,
        objectCreationTimeout: 10,
        dropzoneIdleMessage: dynamic("Drag and drop files here"),
        dropzoneAcceptedMessage: dynamic("All files can be uploaded."),
        dropzoneRejectedMessage: dynamic("Some files may not be uploadable."),
        uploadInProgressMessage: dynamic("Uploading..."),
        uploadQueuedMessage: dynamic("Waiting..."),
        uploadSuccessMessage: dynamic("Uploaded successfully."),
        uploadFailureGenericMessage: dynamic("An error occurred during uploading."),
        uploadFailureInvalidFileFormatMessage: dynamic("File format is not supported, supported formats are ###."),
        uploadFailureFileIsTooBigMessage: dynamic("File size exceeds the maximum limit of ### megabytes."),
        uploadFailureTooManyFilesMessage: dynamic("Too many files added. Only ### files per upload are allowed."),
        uploadLimitReachedMessage: dynamic("Maximum file count of ### reached."),
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

function makeFile(name: string): File {
    return new File([""], name, { type: "text/plain" });
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
    return FileStore.newFileWithValidationError(new File([], "bad.txt"), "bad format", store);
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

// ─── FileStore unit tests ────────────────────────────────────────────────────

describe("FileStore.setQueued", () => {
    test("sets status to 'queued' and clears errorDescription", () => {
        const rootStore = buildStore();
        const file = new FileStore("rejected", rootStore, makeFile("test.txt"));
        file.errorDescription = "too many files";

        file.setQueued();

        expect(file.fileStatus).toBe("queued");
        expect(file.errorDescription).toBeUndefined();
    });
});

describe("FileStore.upload", () => {
    test("transitions from 'queued' to 'uploading' then to error on failure", async () => {
        const rootStore = buildStore();
        const file = new FileStore("queued", rootStore, makeFile("test.txt"));
        rootStore.objectCreationHelper.request = jest.fn().mockRejectedValue(new Error("mocked"));

        await file.upload();

        expect(file.fileStatus).toBe("uploadingError");
    });

    test("does not start upload if status is not 'queued'", async () => {
        const rootStore = buildStore();
        const file = new FileStore("validationError", rootStore, makeFile("test.txt"));
        rootStore.objectCreationHelper.request = jest.fn();

        await file.upload();

        expect(rootStore.objectCreationHelper.request).not.toHaveBeenCalled();
    });

    test("does not start upload if status is 'existingFile'", async () => {
        const rootStore = buildStore();
        const file = new FileStore("existingFile", rootStore, undefined, obj("a") as any);
        rootStore.objectCreationHelper.request = jest.fn();

        await file.upload();

        expect(rootStore.objectCreationHelper.request).not.toHaveBeenCalled();
    });
});

describe("FileStore.markMissing", () => {
    test("transitions to 'missing' from 'existingFile'", () => {
        const rootStore = buildStore();
        const file = new FileStore("existingFile", rootStore, undefined, obj("a") as any);

        file.markMissing();

        expect(file.fileStatus).toBe("missing");
    });

    test("transitions to 'removedFile' (not 'missing') when status is 'uploadingError'", () => {
        const rootStore = buildStore();
        const file = new FileStore("uploadingError", rootStore, makeFile("test.txt"));

        file.markMissing();

        expect(file.fileStatus).toBe("removedFile");
    });
});

describe("FileStore — removed legacy statuses", () => {
    test("FileStore does not have errorType property", () => {
        const rootStore = buildStore();
        const file = new FileStore("queued", rootStore, makeFile("test.txt"));

        expect(Object.prototype.hasOwnProperty.call(file, "errorType")).toBe(false);
        expect("errorType" in file).toBe(false);
    });
});

describe("FileStore.newFile", () => {
    test("creates file with 'queued' status", () => {
        const rootStore = buildStore();
        const file = FileStore.newFile(makeFile("test.txt"), rootStore);

        expect(file.fileStatus).toBe("queued");
    });
});

describe("FileStore.newRejectedFile", () => {
    test("creates file with 'rejected' status and errorDescription", () => {
        const rootStore = buildStore();
        const file = FileStore.newRejectedFile(makeFile("test.txt"), "Too many files", rootStore);

        expect(file.fileStatus).toBe("rejected");
        expect(file.errorDescription).toBe("Too many files");
    });
});

// ─── FileUploaderStore — renamed properties ──────────────────────────────────

describe("FileUploaderStore — renamed properties", () => {
    test("maxTotalFiles reads from maxFilesPerUpload XML prop", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(7)) });

        expect(store.maxTotalFiles).toBe(7);
    });

    test("maxConcurrentUploads reads from maxFilesPerBatch XML prop", () => {
        const store = buildStore({ maxFilesPerBatch: dynamic(new Big(3)) });

        expect(store.maxConcurrentUploads).toBe(3);
    });

    test("maxTotalFiles returns 0 (unlimited) when expression unavailable", () => {
        const store = buildStore({ maxFilesPerUpload: unavailableDynamic() });

        expect(store.maxTotalFiles).toBe(0);
    });

    test("maxConcurrentUploads returns 0 (unlimited) when expression unavailable", () => {
        const store = buildStore({ maxFilesPerBatch: unavailableDynamic() });

        expect(store.maxConcurrentUploads).toBe(0);
    });
});

// ─── FileUploaderStore — removed legacy API ──────────────────────────────────

describe("FileUploaderStore — removed legacy methods", () => {
    test("dismissValidationErrors does not exist", () => {
        const store = buildStore();

        expect((store as any).dismissValidationErrors).toBeUndefined();
    });

    test("retryLimitExceededFiles does not exist", () => {
        const store = buildStore();

        expect((store as any).retryLimitExceededFiles).toBeUndefined();
    });
});

// ─── FileUploaderStore.processDrop — pure classifier ─────────────────────────

describe("FileUploaderStore.processDrop — pure classifier", () => {
    test("accepted files within capacity enter upload pipeline (queued or uploading)", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(5)) });

        store.processDrop(
            [1, 2, 3].map(n => makeFile(`file${n}.txt`)),
            []
        );

        const inPipeline = store.files.filter(f => f.fileStatus === "queued" || f.fileStatus === "uploading");
        expect(inPipeline).toHaveLength(3);
    });

    test("files exceeding maxTotalFiles go to 'rejected' status", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        store.processDrop(
            [1, 2, 3, 4].map(n => makeFile(`file${n}.txt`)),
            []
        );

        expect(store.files.filter(f => f.fileStatus === "rejected")).toHaveLength(2);
        const inPipeline = store.files.filter(f => f.fileStatus === "queued" || f.fileStatus === "uploading");
        expect(inPipeline).toHaveLength(2);
    });

    test("format/size rejected files go to 'validationError' status", () => {
        const store = buildStore();
        const rejections = [
            { file: makeFile("bad.exe"), errors: [{ code: "file-invalid-type", message: "bad type" }] }
        ];

        store.processDrop([], rejections as any);

        expect(store.files.filter(f => f.fileStatus === "validationError")).toHaveLength(1);
    });

    test("no file gets 'batchExceeded' treatment — excess files enter pipeline or rejected only", () => {
        const store = buildStore({ maxFilesPerBatch: dynamic(new Big(2)), maxFilesPerUpload: dynamic(new Big(10)) });

        store.processDrop(
            [1, 2, 3, 4].map(n => makeFile(`file${n}.txt`)),
            []
        );

        const statuses = store.files.map(f => f.fileStatus);
        expect(statuses.every(s => s === "queued" || s === "uploading" || s === "rejected")).toBe(true);
    });

    test("no file has errorType set after processDrop", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        store.processDrop(
            [1, 2, 3, 4].map(n => makeFile(`file${n}.txt`)),
            []
        );

        const withErrorType = store.files.filter(f => (f as any).errorType !== undefined);
        expect(withErrorType).toHaveLength(0);
    });

    test("drop with maxConcurrentUploads=2: exactly 2 start uploading, rest stay queued", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(10)),
            maxFilesPerBatch: dynamic(new Big(2))
        });
        store.objectCreationHelper.request = jest.fn().mockRejectedValue(new Error("no server"));

        store.processDrop(
            [1, 2, 3, 4].map(n => makeFile(`file${n}.txt`)),
            []
        );

        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(2);
        expect(store.files.filter(f => f.fileStatus === "queued")).toHaveLength(2);
    });

    test("drop with no concurrent limit: all files start uploading immediately", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(10)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest.fn().mockRejectedValue(new Error("no server"));

        store.processDrop(
            [1, 2, 3].map(n => makeFile(`file${n}.txt`)),
            []
        );

        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(3);
        expect(store.files.filter(f => f.fileStatus === "queued")).toHaveLength(0);
    });
});

// ─── FileUploaderStore.isFileUploadLimitReached ───────────────────────────────

describe("FileUploaderStore.isFileUploadLimitReached", () => {
    test("'queued' counts toward maxTotalFiles", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        store.files.push({ fileStatus: "queued" } as any, { fileStatus: "queued" } as any);

        expect(store.isFileUploadLimitReached).toBe(true);
    });

    test("'existingFile' counts toward maxTotalFiles", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        store.files.push({ fileStatus: "existingFile" } as any, { fileStatus: "existingFile" } as any);

        expect(store.isFileUploadLimitReached).toBe(true);
    });

    test("'uploading' counts toward maxTotalFiles", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(1)) });

        store.files.push({ fileStatus: "uploading" } as any);

        expect(store.isFileUploadLimitReached).toBe(true);
    });

    test("'done' counts toward maxTotalFiles", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(1)) });

        store.files.push({ fileStatus: "done" } as any);

        expect(store.isFileUploadLimitReached).toBe(true);
    });

    test("'rejected' does NOT count toward maxTotalFiles", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        store.files.push(
            { fileStatus: "rejected" } as any,
            { fileStatus: "rejected" } as any,
            { fileStatus: "rejected" } as any
        );

        expect(store.isFileUploadLimitReached).toBe(false);
    });

    test("'uploadingError' does NOT count toward maxTotalFiles", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(1)) });

        store.files.push({ fileStatus: "uploadingError" } as any);

        expect(store.isFileUploadLimitReached).toBe(false);
    });

    test("excludes missing, removedFile, validationError from active count", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        store.files.push(
            { fileStatus: "existingFile" } as any,
            { fileStatus: "missing" } as any,
            { fileStatus: "removedFile" } as any,
            { fileStatus: "validationError" } as any
        );

        expect(store.isFileUploadLimitReached).toBe(false);
    });

    test("returns false when maxTotalFiles is 0 (unlimited)", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(0)) });

        store.files.push(
            { fileStatus: "existingFile" } as any,
            { fileStatus: "existingFile" } as any,
            { fileStatus: "existingFile" } as any
        );

        expect(store.isFileUploadLimitReached).toBe(false);
    });

    test("returns false when maxTotalFiles expression is unavailable (unlimited fallback)", () => {
        const store = buildStore({ maxFilesPerUpload: unavailableDynamic() });

        store.files.push({ fileStatus: "existingFile" } as any);

        expect(store.isFileUploadLimitReached).toBe(false);
    });
});

// ─── FileUploaderStore.promoteRejectedFiles ───────────────────────────────────

describe("FileUploaderStore.promoteRejectedFiles", () => {
    test("promotes oldest 'rejected' file first (FIFO)", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(3)) });

        // Files are unshifted (prepended), so highest index = oldest.
        // newest at index 0, oldest at index 1
        const newest = { fileStatus: "rejected", setQueued: jest.fn(), upload: jest.fn() } as any;
        const oldest = { fileStatus: "rejected", setQueued: jest.fn(), upload: jest.fn() } as any;

        store.files.push(newest, oldest, { fileStatus: "existingFile" } as any, { fileStatus: "existingFile" } as any);

        store.promoteRejectedFiles();

        expect(oldest.setQueued).toHaveBeenCalledTimes(1);
        expect(newest.setQueued).not.toHaveBeenCalled();
    });

    test("promotes multiple rejected files when multiple slots open", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(4)) });

        // 2 existing, 2 slots open
        const newest = { fileStatus: "rejected", setQueued: jest.fn(), upload: jest.fn() } as any;
        const middle = { fileStatus: "rejected", setQueued: jest.fn(), upload: jest.fn() } as any;
        const oldest = { fileStatus: "rejected", setQueued: jest.fn(), upload: jest.fn() } as any;

        store.files.push(
            newest,
            middle,
            oldest,
            { fileStatus: "existingFile" } as any,
            { fileStatus: "existingFile" } as any
        );

        store.promoteRejectedFiles();

        expect(oldest.setQueued).toHaveBeenCalledTimes(1);
        expect(middle.setQueued).toHaveBeenCalledTimes(1);
        expect(newest.setQueued).not.toHaveBeenCalled();
    });

    test("does nothing when at or above maxTotalFiles", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        const rejected = { fileStatus: "rejected", setQueued: jest.fn(), upload: jest.fn() } as any;

        store.files.push(rejected, { fileStatus: "existingFile" } as any, { fileStatus: "existingFile" } as any);

        store.promoteRejectedFiles();

        expect(rejected.setQueued).not.toHaveBeenCalled();
    });

    test("does nothing when no rejected files exist", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(3)) });

        store.files.push({ fileStatus: "existingFile" } as any);

        // Should not throw
        expect(() => store.promoteRejectedFiles()).not.toThrow();
    });

    test("triggers when active file is removed from the array", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        const active = { fileStatus: "existingFile" } as any;
        const rejected = { fileStatus: "rejected", setQueued: jest.fn(), upload: jest.fn() } as any;

        store.files.push(rejected, active, { fileStatus: "existingFile" } as any);

        store.files.splice(store.files.indexOf(active), 1);

        expect(rejected.setQueued).toHaveBeenCalledTimes(1);
    });

    test("promoted rejected file actually starts uploading after setQueued", async () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(2)),
            maxFilesPerBatch: unavailableDynamic()
        });
        const neverResolve = new Promise<never>(() => {});
        store.objectCreationHelper.request = jest.fn().mockReturnValue(neverResolve);

        // Drop 3 files: 2 upload, 1 rejected
        store.processDrop([makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt")], []);

        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(2);
        expect(store.files.filter(f => f.fileStatus === "rejected")).toHaveLength(1);

        // Delete one uploading file's slot by marking it done
        store.files[store.files.findIndex(f => f.fileStatus === "uploading")].fileStatus = "removedFile" as any;

        // Reaction: activeCount drops → promoteRejectedFiles → setQueued → promoteQueuedFiles → upload
        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(2);
        expect(store.files.filter(f => f.fileStatus === "rejected")).toHaveLength(0);
    });
});

// ─── FileUploaderStore.promoteQueuedFiles ─────────────────────────────────────

describe("FileUploaderStore.promoteQueuedFiles", () => {
    test("calls upload() on queued files up to maxConcurrentUploads", () => {
        const store = buildStore({ maxFilesPerBatch: dynamic(new Big(2)) });

        const queued1 = { fileStatus: "queued", upload: jest.fn() } as any;
        const queued2 = { fileStatus: "queued", upload: jest.fn() } as any;
        const queued3 = { fileStatus: "queued", upload: jest.fn() } as any;

        store.files.push(queued3, queued2, queued1);

        store.promoteQueuedFiles();

        const uploadedCount = [queued1, queued2, queued3].filter(f => f.upload.mock.calls.length > 0).length;
        expect(uploadedCount).toBe(2);
    });

    test("does not promote beyond available concurrent slots", () => {
        const store = buildStore({ maxFilesPerBatch: dynamic(new Big(2)) });

        const uploading = { fileStatus: "uploading" } as any;
        const queued1 = { fileStatus: "queued", upload: jest.fn() } as any;
        const queued2 = { fileStatus: "queued", upload: jest.fn() } as any;

        // 1 slot already used
        store.files.push(queued2, queued1, uploading);

        store.promoteQueuedFiles();

        const uploadedCount = [queued1, queued2].filter(f => f.upload.mock.calls.length > 0).length;
        expect(uploadedCount).toBe(1);
    });

    test("does nothing when all concurrent slots are occupied", () => {
        const store = buildStore({ maxFilesPerBatch: dynamic(new Big(2)) });

        const uploading1 = { fileStatus: "uploading" } as any;
        const uploading2 = { fileStatus: "uploading" } as any;
        const queued = { fileStatus: "queued", upload: jest.fn() } as any;

        store.files.push(queued, uploading1, uploading2);

        store.promoteQueuedFiles();

        expect(queued.upload).not.toHaveBeenCalled();
    });

    test("does nothing when no queued files exist", () => {
        const store = buildStore({ maxFilesPerBatch: dynamic(new Big(2)) });

        store.files.push({ fileStatus: "existingFile" } as any);

        expect(() => store.promoteQueuedFiles()).not.toThrow();
    });

    test("queued file starts uploading when a concurrent slot frees up", async () => {
        const store = buildStore({
            maxFilesPerBatch: dynamic(new Big(1)),
            maxFilesPerUpload: dynamic(new Big(10))
        });
        const neverResolve = new Promise<never>(() => {});
        store.objectCreationHelper.request = jest.fn().mockReturnValue(neverResolve);

        // Drop 2 files: 1 starts uploading, 1 waits queued
        store.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);

        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(1);
        expect(store.files.filter(f => f.fileStatus === "queued")).toHaveLength(1);

        // Mark the uploading file as done (simulate slot freed)
        store.files[store.files.findIndex(f => f.fileStatus === "uploading")].fileStatus = "done" as any;

        // Reaction fires: uploadingCount dropped → promoteQueuedFiles → queued file starts
        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(1);
        expect(store.files.filter(f => f.fileStatus === "queued")).toHaveLength(0);
    });
});

// ─── FileUploaderStore.warningMessage ────────────────────────────────────────

describe("FileUploaderStore.warningMessage", () => {
    test("returns undefined when no limit set and no error", () => {
        const store = buildStore({ maxFilesPerUpload: unavailableDynamic() });

        expect(store.warningMessage).toBeUndefined();
    });

    test("returns undefined when under maxTotalFiles limit", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(5)) });

        expect(store.warningMessage).toBeUndefined();
    });

    test("returns limit-reached message when maxTotalFiles reached", () => {
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

// ─── End-to-end queue integration ────────────────────────────────────────────

describe("upload queue — end-to-end", () => {
    test("upload error frees concurrent slot and next queued file starts uploading", async () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(10)),
            maxFilesPerBatch: dynamic(new Big(1))
        });
        // First request fails, second hangs so we can assert the stable "uploading" state
        const neverResolve = new Promise<never>(() => {});
        store.objectCreationHelper.request = jest
            .fn()
            .mockRejectedValueOnce(new Error("server error"))
            .mockReturnValueOnce(neverResolve);

        store.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);

        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(1);
        expect(store.files.filter(f => f.fileStatus === "queued")).toHaveLength(1);

        // Wait for first upload to fail
        await Promise.resolve();
        await Promise.resolve();

        // Error frees slot → queued file promotes to uploading (second request hangs)
        expect(store.files.filter(f => f.fileStatus === "uploadingError")).toHaveLength(1);
        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(1);
        expect(store.files.filter(f => f.fileStatus === "queued")).toHaveLength(0);
    });

    test("upload errors free active slots and promote oldest rejected file to uploading", async () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(2)),
            maxFilesPerBatch: unavailableDynamic()
        });
        // First two requests fail, third hangs so we can assert the stable "uploading" state
        const neverResolve = new Promise<never>(() => {});
        store.objectCreationHelper.request = jest
            .fn()
            .mockRejectedValueOnce(new Error("fail a"))
            .mockRejectedValueOnce(new Error("fail b"))
            .mockReturnValueOnce(neverResolve);

        // Drop 3 files — 2 start uploading, 1 rejected (over maxTotalFiles)
        store.processDrop([makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt")], []);

        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(2);
        expect(store.files.filter(f => f.fileStatus === "rejected")).toHaveLength(1);

        // Wait for both uploads to fail
        await Promise.resolve();
        await Promise.resolve();

        // Both errors free active count → rejected promotes to uploading (third request hangs)
        expect(store.files.filter(f => f.fileStatus === "uploadingError")).toHaveLength(2);
        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(1);
        expect(store.files.filter(f => f.fileStatus === "rejected")).toHaveLength(0);
    });
});
