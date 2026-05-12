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

describe("FileUploaderStore.dismissValidationErrors()", () => {
    it("removes only validationError files", () => {
        const store = makeStore();
        const validationFile = makeValidationErrorFile(store);
        const doneFile = makeDoneFile(store);
        store.files = [validationFile, doneFile];

        store.dismissValidationErrors();

        expect(store.files).toHaveLength(1);
        expect(store.files[0]).toBe(doneFile);
    });

    it("leaves files untouched when none have validationError status", () => {
        const store = makeStore();
        const doneFile = makeDoneFile(store);
        store.files = [doneFile];

        store.dismissValidationErrors();

        expect(store.files).toHaveLength(1);
    });

    it("empties files when all have validationError status", () => {
        const store = makeStore();
        store.files = [makeValidationErrorFile(store), makeValidationErrorFile(store)];

        store.dismissValidationErrors();

        expect(store.files).toHaveLength(0);
    });
});

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
