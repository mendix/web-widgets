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
        retryButtonTextMessage: dynamic("Retry upload"),
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
        const fileA = makeValidationErrorFile(store);
        const fileB = makeValidationErrorFile(store);
        store.files = [fileA];

        store.dismissFile(fileB);

        expect(store.files).toHaveLength(1);
        expect(store.files[0]).toBe(fileA);
    });
});

// ─── FileStore unit tests ────────────────────────────────────────────────────

describe("FileStore.setQueued", () => {
    test("sets status to 'queued' and clears errorDescription", () => {
        const rootStore = buildStore();
        const file = new FileStore("validationError", rootStore, makeFile("test.txt"));
        file.errorDescription = "invalid format";

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
    test("creates file with 'rejected' status", () => {
        const rootStore = buildStore();
        const file = FileStore.newRejectedFile(makeFile("test.txt"), rootStore);

        expect(file.fileStatus).toBe("rejected");
    });
});

// ─── FileStore.canRetry ───────────────────────────────────────────────────────

describe("FileStore.canRetry", () => {
    test("true when file is rejected and limit is not full", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(3)),
            maxFilesPerBatch: unavailableDynamic()
        });
        const file = FileStore.newRejectedFile(makeFile("x.txt"), store);
        store.files.push(file);

        expect(file.canRetry).toBe(true);
    });

    test("false when file is rejected but limit is full", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(2)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest.fn().mockReturnValue(new Promise(() => {}));

        store.processDrop([makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt")], []);

        const rejected = store.files.find(f => f.fileStatus === "rejected")!;
        expect(rejected.canRetry).toBe(false);
    });

    test("false when file is not in rejected status", () => {
        const store = buildStore();
        const file = new FileStore("validationError", store, makeFile("x.txt"));
        store.files.push(file);

        expect(file.canRetry).toBe(false);
    });
});

// ─── FileStore.canRetry — reactivity when limit changes ──────────────────────

describe("FileStore.canRetry — reacts to freed slots", () => {
    test("flips to true when an active file errors and frees a slot", async () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(1)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest.fn().mockRejectedValueOnce(new Error("fail"));

        // 1 active, 1 rejected — limit full
        store.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);

        const rejected = store.files.find(f => f.fileStatus === "rejected")!;
        expect(rejected.canRetry).toBe(false);

        // Wait for upload to fail — active file → uploadingError, slot freed
        await Promise.resolve();
        await Promise.resolve();

        expect(store.files.find(f => f.fileStatus === "uploadingError")).toBeDefined();
        expect(rejected.canRetry).toBe(true);
    });

    test("flips to true when an active file is removed and frees a slot", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(1)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest.fn().mockReturnValue(new Promise(() => {}));

        // 1 active (uploading), 1 rejected — limit full
        store.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);

        const rejected = store.files.find(f => f.fileStatus === "rejected")!;
        expect(rejected.canRetry).toBe(false);

        // Simulate removal of the active file — slot freed
        const active = store.files.find(f => f.fileStatus === "uploading")!;
        active.fileStatus = "removedFile" as any;

        expect(rejected.canRetry).toBe(true);
    });

    test("both rejected files get canRetry=true when one slot frees", async () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(2)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest
            .fn()
            .mockRejectedValueOnce(new Error("fail"))
            .mockReturnValue(new Promise(() => {}));

        // 2 active, 2 rejected — limit full
        store.processDrop([makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt"), makeFile("d.txt")], []);

        const rejected = store.files.filter(f => f.fileStatus === "rejected");
        expect(rejected).toHaveLength(2);
        expect(rejected[0].canRetry).toBe(false);
        expect(rejected[1].canRetry).toBe(false);

        // Wait for first upload to fail — activeCount drops 2→1, limit no longer reached
        await Promise.resolve();
        await Promise.resolve();

        expect(rejected[0].canRetry).toBe(true);
        expect(rejected[1].canRetry).toBe(true);
    });
});

// ─── FileStore.retry ─────────────────────────────────────────────────────────

describe("FileStore.retry", () => {
    test("transitions rejected file to uploading via queue reaction", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(3)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest.fn().mockReturnValue(new Promise(() => {}));

        const file = FileStore.newRejectedFile(makeFile("x.txt"), store);
        store.files.push(file);

        file.retry();

        expect(file.fileStatus).toBe("uploading");
    });

    test("does nothing when file is not in rejected status (validationError)", () => {
        const store = buildStore();
        store.objectCreationHelper.request = jest.fn();

        const file = new FileStore("validationError", store, makeFile("x.txt"));
        store.files.push(file);

        file.retry();

        expect(store.objectCreationHelper.request).not.toHaveBeenCalled();
    });

    test("does nothing when total limit is full (limit reached)", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(1)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest.fn().mockReturnValue(new Promise(() => {}));

        // Fill the limit with 1 active file, then add 1 rejected
        store.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);

        const rejected = store.files.find(f => f.fileStatus === "rejected")!;
        expect(rejected.canRetry).toBe(false);

        rejected.retry();

        expect(rejected.fileStatus).toBe("rejected");
    });
});

// ─── FileUploaderStore.queuedCount ───────────────────────────────────────────

describe("FileUploaderStore.queuedCount", () => {
    test("returns 0 when no files are queued", () => {
        const store = buildStore();

        expect(store.queuedCount).toBe(0);
    });

    test("counts files with queued status", () => {
        const store = buildStore();

        store.files.push(
            { fileStatus: "queued" } as any,
            { fileStatus: "queued" } as any,
            { fileStatus: "uploading" } as any,
            { fileStatus: "existingFile" } as any
        );

        expect(store.queuedCount).toBe(2);
    });

    test("increases when processDrop adds queued files", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(10)),
            maxFilesPerBatch: dynamic(new Big(1))
        });
        store.objectCreationHelper.request = jest.fn().mockReturnValue(new Promise(() => {}));

        store.processDrop([makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt")], []);

        // 1 uploading, 2 still queued
        expect(store.queuedCount).toBe(2);
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

    test("maxFileSize returns bytes converted from MiB", () => {
        const store = buildStore({ maxFileSize: 10 });

        expect(store.maxFileSize).toBe(10 * 1024 * 1024);
    });
});

// ─── FileUploaderStore — removed legacy API ──────────────────────────────────

describe("FileUploaderStore — removed legacy methods", () => {
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

// ─── Reaction 3: queuedCount rises → promoteQueuedFiles (fully reactive drain) ─

describe("FileUploaderStore — Reaction 3: queue auto-drains when queued files arrive", () => {
    test("files queued by processDrop start uploading without any manual drain call", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(10)),
            maxFilesPerBatch: dynamic(new Big(1))
        });
        store.objectCreationHelper.request = jest.fn().mockReturnValue(new Promise(() => {}));

        // processDrop sets files to 'queued'; Reaction 3 must drain them automatically
        store.processDrop([makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt")], []);

        // With concurrent limit=1: exactly 1 uploading, 2 still queued
        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(1);
        expect(store.files.filter(f => f.fileStatus === "queued")).toHaveLength(2);
    });

    test("manually setting a file to queued triggers upload automatically", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(10)),
            maxFilesPerBatch: dynamic(new Big(2))
        });
        store.objectCreationHelper.request = jest.fn().mockReturnValue(new Promise(() => {}));

        const file = new FileStore("rejected", store, makeFile("x.txt"));
        store.files.push(file);

        // Manually queue the file — Reaction 3 should pick it up
        file.setQueued();

        expect(file.fileStatus).toBe("uploading");
    });

    test("rejected file does NOT auto-promote when a slot frees — manual retry required", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(2)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest.fn().mockReturnValue(new Promise(() => {}));

        // Fill to limit — 2 uploading, 1 rejected
        store.processDrop([makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt")], []);

        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(2);
        expect(store.files.filter(f => f.fileStatus === "rejected")).toHaveLength(1);

        // Free a slot — rejected file must stay rejected (no auto-promote)
        store.files[store.files.findIndex(f => f.fileStatus === "uploading")].fileStatus = "removedFile" as any;

        expect(store.files.filter(f => f.fileStatus === "rejected")).toHaveLength(1);
        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(1);
    });
});

// ─── FileUploaderStore.isFileUploadLimitReached ───────────────────────────────

describe("FileUploaderStore.isFileUploadLimitReached", () => {
    test("false when no files have been dropped", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(3)) });

        expect(store.isFileUploadLimitReached).toBe(false);
    });

    test("false when below the configured limit", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(3)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest.fn().mockReturnValue(new Promise(() => {}));

        store.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);

        expect(store.isFileUploadLimitReached).toBe(false);
    });

    test("true when exactly at the limit", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(2)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest.fn().mockReturnValue(new Promise(() => {}));

        store.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);

        expect(store.isFileUploadLimitReached).toBe(true);
    });

    test("rejected files (over cap) do not contribute to active count", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(2)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest.fn().mockReturnValue(new Promise(() => {}));

        store.processDrop([makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt")], []);

        expect(store.files.filter(f => f.fileStatus === "rejected")).toHaveLength(1);
        expect(store.activeCount).toBe(2);
    });

    test("validationError files do not count toward active count", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        store.processDrop([], [
            { file: makeFile("bad1.exe"), errors: [{ code: "file-invalid-type", message: "" }] },
            { file: makeFile("bad2.exe"), errors: [{ code: "file-invalid-type", message: "" }] },
            { file: makeFile("bad3.exe"), errors: [{ code: "file-invalid-type", message: "" }] }
        ] as any);

        expect(store.files.filter(f => f.fileStatus === "validationError")).toHaveLength(3);
        expect(store.isFileUploadLimitReached).toBe(false);
    });

    test("uploadingError files do not count toward active count", async () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(2)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest.fn().mockRejectedValue(new Error("fail"));

        store.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);

        await Promise.resolve();
        await Promise.resolve();

        expect(store.files.filter(f => f.fileStatus === "uploadingError")).toHaveLength(2);
        expect(store.isFileUploadLimitReached).toBe(false);
    });

    test("false when maxTotalFiles is 0 (unlimited), regardless of file count", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(0)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest.fn().mockReturnValue(new Promise(() => {}));

        store.processDrop([makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt")], []);

        expect(store.isFileUploadLimitReached).toBe(false);
    });

    test("false when maxTotalFiles expression is unavailable (unlimited fallback)", () => {
        const store = buildStore({
            maxFilesPerUpload: unavailableDynamic(),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest.fn().mockReturnValue(new Promise(() => {}));

        store.processDrop([makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt")], []);

        expect(store.isFileUploadLimitReached).toBe(false);
    });
});

// ─── FileUploaderStore.sortedFiles ───────────────────────────────────────────

describe("FileUploaderStore.sortedFiles", () => {
    test("validationError files sort to the end", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(10)) });

        // First drop an accepted file, then a validation error — error ends up at index 0
        store.processDrop([makeFile("good.txt")], []);
        store.processDrop([], [
            { file: makeFile("bad.exe"), errors: [{ code: "file-invalid-type", message: "" }] }
        ] as any);

        expect(store.files[0].fileStatus).toBe("validationError"); // confirm unsorted state

        const sorted = store.sortedFiles;
        expect(sorted[0].fileStatus).not.toBe("validationError");
        expect(sorted[sorted.length - 1].fileStatus).toBe("validationError");
    });

    test("does not mutate the original files array", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(10)) });

        store.processDrop([makeFile("good.txt")], []);
        store.processDrop([], [
            { file: makeFile("bad.exe"), errors: [{ code: "file-invalid-type", message: "" }] }
        ] as any);

        const originalFirst = store.files[0];
        const sorted = store.sortedFiles;
        expect(sorted).not.toBe(store.files);
        expect(store.files[0]).toBe(originalFirst);
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

// ─── FileUploaderStore.createActionFailed ────────────────────────────────────

describe("FileUploaderStore.createActionFailed", () => {
    test("defaults to false", () => {
        const store = buildStore({});

        expect(store.createActionFailed).toBe(false);
    });

    test("setCreateActionFailed(true) sets flag", () => {
        const store = buildStore({});
        store.setCreateActionFailed(true);

        expect(store.createActionFailed).toBe(true);
    });

    test("setCreateActionFailed(false) clears flag", () => {
        const store = buildStore({});
        store.setCreateActionFailed(true);
        store.setCreateActionFailed(false);

        expect(store.createActionFailed).toBe(false);
    });
});

// ─── FileUploaderStore.processDrop — unavailable create action ───────────────

describe("FileUploaderStore.processDrop — unavailable create action", () => {
    test("sets createActionFailed when canCreateFiles is false", () => {
        const store = buildStore({ createFileAction: actionValue(false, false) });

        store.processDrop([makeFile("a.txt")], []);

        expect(store.createActionFailed).toBe(true);
        expect(store.files).toHaveLength(0);
    });

    test("clears createActionFailed on next successful drop", () => {
        const store = buildStore({ createFileAction: actionValue(false, false) });
        store.processDrop([makeFile("a.txt")], []);
        expect(store.createActionFailed).toBe(true);

        store.objectCreationHelper.updateProps(buildProps({ createFileAction: actionValue(true, false) }));
        store.processDrop([makeFile("b.txt")], []);

        expect(store.createActionFailed).toBe(false);
    });
});

// ─── FileUploaderStore.processDrop — error message mapping ───────────────────

describe("FileUploaderStore.processDrop — error message mapping", () => {
    test("file-invalid-type rejection uses allowedFormats in message", () => {
        const store = buildStore({ allowedFileFormats: [] });

        store.processDrop([], [
            { file: makeFile("bad.exe"), errors: [{ code: "file-invalid-type", message: "" }] }
        ] as any);

        expect(store.files[0].errorDescription).toContain("not supported");
    });

    test("file-too-large rejection includes max size in message", () => {
        const store = buildStore({ maxFileSize: 10 });

        store.processDrop([], [
            { file: makeFile("big.zip"), errors: [{ code: "file-too-large", message: "" }] }
        ] as any);

        expect(store.files[0].errorDescription).toContain("10");
    });
});

// ─── FileUploaderStore.updateProps ───────────────────────────────────────────

describe("FileUploaderStore.updateProps", () => {
    test("live increase of maxTotalFiles unblocks dropzone mid-session", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(2)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest.fn().mockReturnValue(new Promise(() => {}));

        store.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);
        expect(store.isFileUploadLimitReached).toBe(true);

        store.updateProps(
            buildProps({ maxFilesPerUpload: dynamic(new Big(5)), maxFilesPerBatch: unavailableDynamic() })
        );

        expect(store.isFileUploadLimitReached).toBe(false);
    });

    test("live decrease of maxConcurrentUploads is reflected immediately", () => {
        const store = buildStore({ maxFilesPerBatch: dynamic(new Big(4)) });
        expect(store.maxConcurrentUploads).toBe(4);

        store.updateProps(buildProps({ maxFilesPerBatch: dynamic(new Big(1)) }));

        expect(store.maxConcurrentUploads).toBe(1);
    });
});

// ─── FileUploaderStore.dispose ───────────────────────────────────────────────

describe("FileUploaderStore.dispose", () => {
    test("queue drain reaction stops firing after dispose", () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(10)),
            maxFilesPerBatch: dynamic(new Big(1))
        });
        const neverResolve = new Promise<never>(() => {});
        store.objectCreationHelper.request = jest.fn().mockReturnValue(neverResolve);

        store.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);

        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(1);
        expect(store.files.filter(f => f.fileStatus === "queued")).toHaveLength(1);

        store.dispose();

        // Freeing a concurrent slot after dispose should NOT start the queued file
        store.files[store.files.findIndex(f => f.fileStatus === "uploading")].fileStatus = "done" as any;

        expect(store.files.filter(f => f.fileStatus === "queued")).toHaveLength(1);
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

    test("upload errors do NOT auto-promote rejected files — user must retry manually", async () => {
        const store = buildStore({
            maxFilesPerUpload: dynamic(new Big(2)),
            maxFilesPerBatch: unavailableDynamic()
        });
        store.objectCreationHelper.request = jest
            .fn()
            .mockRejectedValueOnce(new Error("fail a"))
            .mockRejectedValueOnce(new Error("fail b"));

        // Drop 3 files — 2 start uploading, 1 rejected (over maxTotalFiles)
        store.processDrop([makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt")], []);

        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(2);
        expect(store.files.filter(f => f.fileStatus === "rejected")).toHaveLength(1);

        // Wait for both uploads to fail
        await Promise.resolve();
        await Promise.resolve();

        // Errors free activeCount slots but rejected file must NOT auto-promote
        expect(store.files.filter(f => f.fileStatus === "uploadingError")).toHaveLength(2);
        expect(store.files.filter(f => f.fileStatus === "rejected")).toHaveLength(1);
        expect(store.files.filter(f => f.fileStatus === "uploading")).toHaveLength(0);
    });
});
