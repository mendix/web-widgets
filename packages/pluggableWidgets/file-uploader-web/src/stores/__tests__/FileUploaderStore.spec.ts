import { Big } from "big.js";
import { FileRejection } from "react-dropzone";
import { actionValue, dynamic } from "@mendix/widget-plugin-test-utils";
import { FileUploaderContainerProps } from "../../../typings/FileUploaderProps";
import {
    buildProps,
    creatableList,
    flushPromises,
    makeFile,
    MockListAction,
    mockListAction,
    plainList
} from "../../__tests__/testProps";
import { saveFile } from "../../utils/mx-data";
import { FileUploaderStore } from "../FileUploaderStore";
import { TranslationsStore } from "../TranslationsStore";

jest.mock("../../utils/mx-data", () => ({
    saveFile: jest.fn()
}));

const mockFlags = { UPLOAD_ON_CREATE: false };
jest.mock("../../utils/flags", () => ({
    get UPLOAD_ON_CREATE() {
        return mockFlags.UPLOAD_ON_CREATE;
    }
}));

const saveFileMock = saveFile as jest.Mock;

function buildStore(overrides: Partial<FileUploaderContainerProps> = {}): {
    store: FileUploaderStore;
    props: FileUploaderContainerProps;
} {
    const props = buildProps(overrides);
    const store = new FileUploaderStore(props, new TranslationsStore(props));
    return { store, props };
}

/** Simulates the platform reporting a linked action as executing, then finished, on new props. */
async function finishListAction(
    store: FileUploaderStore,
    props: FileUploaderContainerProps,
    listAction: MockListAction
): Promise<void> {
    listAction.setState(true, true);
    store.updateProps(props);
    listAction.setState(true, false);
    store.updateProps(props);
    await flushPromises();
}

function invalidTypeRejection(name: string): FileRejection {
    return { file: makeFile(name), errors: [{ code: "file-invalid-type", message: "invalid" }] };
}

describe("FileUploaderStore", () => {
    beforeEach(() => {
        saveFileMock.mockReset();
        saveFileMock.mockResolvedValue(undefined);
        jest.spyOn(console, "error").mockImplementation(() => {});
        jest.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.useRealTimers();
        mockFlags.UPLOAD_ON_CREATE = false;
    });

    describe("processDrop", () => {
        test("creates one object per accepted file and marks them pending", async () => {
            const files = creatableList();
            const { store } = buildStore({ files });

            store.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);
            expect(store.files.map(f => f.fileStatus)).toEqual(["creating", "creating"]);

            await flushPromises();

            expect(files.create).toHaveBeenCalledTimes(2);
            expect(store.files.map(f => f.fileStatus)).toEqual(["pending", "pending"]);
        });

        test("does not upload on drop", async () => {
            const { store } = buildStore();

            store.processDrop([makeFile()], []);
            await flushPromises();

            expect(saveFileMock).not.toHaveBeenCalled();
        });

        test("marks the file failed when create() rejects", async () => {
            const files = creatableList();
            files.create.mockRejectedValueOnce(new Error("no access"));
            const { store } = buildStore({ files });

            store.processDrop([makeFile()], []);
            await flushPromises();

            expect(store.files[0].fileStatus).toBe("uploadingError");
        });

        test("refuses files when the user can't create objects", () => {
            const files = creatableList("unavailable");
            const { store } = buildStore({ files });

            store.processDrop([makeFile()], []);

            expect(store.createActionFailed).toBe(true);
            expect(store.files).toHaveLength(0);
            expect(files.create).not.toHaveBeenCalled();
        });

        test("refuses files when the datasource does not support creation", () => {
            const { store } = buildStore({ files: plainList() });

            store.processDrop([makeFile()], []);

            expect(store.createActionFailed).toBe(true);
            expect(store.files).toHaveLength(0);
        });

        test("adds files rejected by the dropzone as validation errors, without objects", async () => {
            const files = creatableList();
            const { store } = buildStore({ files });

            store.processDrop([], [invalidTypeRejection("bad.exe")]);
            await flushPromises();

            expect(store.files).toHaveLength(1);
            expect(store.files[0].fileStatus).toBe("validationError");
            expect(store.files[0].errorDescription).toContain("File format is not supported");
            expect(files.create).not.toHaveBeenCalled();
        });

        test("replaces previous validation errors on the next drop", () => {
            const { store } = buildStore();

            store.processDrop([], [invalidTypeRejection("bad1.exe")]);
            store.processDrop([], [invalidTypeRejection("bad2.exe")]);

            expect(store.files.map(f => f.title)).toEqual(["bad2.exe"]);
        });

        test("rejects files over the limit without creating objects", async () => {
            const files = creatableList();
            const { store } = buildStore({ files, maxFilesPerUpload: dynamic.available(new Big(2)) });

            store.processDrop([makeFile("a"), makeFile("b"), makeFile("c")], []);
            await flushPromises();

            expect(files.create).toHaveBeenCalledTimes(2);
            expect(store.files.filter(f => f.fileStatus === "rejected")).toHaveLength(1);
            expect(store.isFileUploadLimitReached).toBe(true);
        });
    });

    describe("dismissFile", () => {
        test("removes a rejected file", () => {
            const { store } = buildStore();
            store.processDrop([], [invalidTypeRejection("bad.exe")]);

            store.dismissFile(store.files[0]);

            expect(store.files).toHaveLength(0);
        });

        test("keeps a pending file (no API to delete its object)", async () => {
            const { store } = buildStore();
            store.processDrop([makeFile()], []);
            await flushPromises();

            store.dismissFile(store.files[0]);

            expect(store.files).toHaveLength(1);
        });
    });

    describe("upload events and failures", () => {
        async function uploadAll(store: FileUploaderStore): Promise<void> {
            store.files.forEach(f => store.uploadFile(f));
            await flushPromises();
        }

        async function storeWithPendingFiles(
            count: number,
            overrides: Partial<FileUploaderContainerProps> = {}
        ): Promise<FileUploaderStore> {
            const { store } = buildStore(overrides);
            store.processDrop(
                Array.from({ length: count }, (_, i) => makeFile(`f${i}.txt`)),
                []
            );
            await flushPromises();
            return store;
        }

        test("announces success after the queued uploads", async () => {
            const store = await storeWithPendingFiles(2);

            await uploadAll(store);

            expect(store.isUploading).toBe(false);
            expect(store.announcement.text).toBe("Uploaded successfully.");
        });

        test("continues with the other files when one content upload fails", async () => {
            const store = await storeWithPendingFiles(2);
            saveFileMock.mockRejectedValueOnce(new Error("network"));

            await uploadAll(store);

            expect(store.files.map(f => f.fileStatus).sort()).toEqual(["done", "uploadingError"]);
            expect(store.announcement.text).toBe("An error occurred during uploading.");
        });

        test("runs On upload once and On upload (per file) for each uploaded file", async () => {
            const uploadAction = actionValue(true, false);
            const uploadItemAction = mockListAction();
            const store = await storeWithPendingFiles(2, { uploadAction, uploadItemAction });

            await uploadAll(store);

            expect(uploadAction.execute).toHaveBeenCalledTimes(1);
            expect(uploadItemAction.executed).toEqual(store.files.map(f => f.objectItem));
        });

        test("does not run On upload (per file) for a failed file", async () => {
            const uploadItemAction = mockListAction();
            const store = await storeWithPendingFiles(1, { uploadItemAction });
            saveFileMock.mockRejectedValueOnce(new Error("network"));

            await uploadAll(store);

            expect(uploadItemAction.executed).toEqual([]);
        });
    });

    describe("removeFile", () => {
        async function pendingStore(overrides: Partial<FileUploaderContainerProps> = {}): Promise<{
            store: FileUploaderStore;
            props: FileUploaderContainerProps;
        }> {
            const { store, props } = buildStore(overrides);
            store.processDrop([makeFile()], []);
            await flushPromises();
            return { store, props };
        }

        test("without On remove, removes the file from the list only", async () => {
            const { store } = await pendingStore();
            expect(store.canRemove(store.files[0])).toBe(true);

            await store.removeFile(store.files[0]);

            expect(store.files).toHaveLength(0);
        });

        test("runs On remove with the file object and removes the file once it has finished", async () => {
            const removeAction = mockListAction();
            const { store, props } = await pendingStore({ removeAction });
            const file = store.files[0];

            const removing = store.removeFile(file);
            expect(removeAction.executed).toEqual([file.objectItem]);
            expect(file.fileStatus).toBe("removing");

            await finishListAction(store, props, removeAction);
            await removing;

            expect(store.files).toHaveLength(0);
        });

        test("keeps the file pending when On remove does not finish in time", async () => {
            jest.useFakeTimers();
            const { store } = await pendingStore({ removeAction: mockListAction() });
            const file = store.files[0];

            const removing = store.removeFile(file);
            jest.advanceTimersByTime(10001);
            await removing;

            expect(store.files).toEqual([file]);
            expect(file.fileStatus).toBe("pending");
        });
    });

    describe("uploadFile", () => {
        test("uploads only the chosen file, without a commit", async () => {
            const uploadItemAction = mockListAction();
            const { store } = buildStore({ uploadItemAction });
            store.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);
            await flushPromises();
            const [first, second] = store.files;

            expect(store.canUploadFile(first)).toBe(true);
            store.uploadFile(first);
            expect(first.fileStatus).toBe("uploading");
            await flushPromises();

            expect(saveFileMock).toHaveBeenCalledTimes(1);
            expect(first.fileStatus).toBe("done");
            expect(second.fileStatus).toBe("pending");
            expect(uploadItemAction.executed).toEqual([first.objectItem]);
            expect(store.canUploadFile(first)).toBe(false);
        });

        test("uploads files clicked while another upload runs", async () => {
            const { store } = buildStore();
            store.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);
            await flushPromises();

            store.uploadFile(store.files[0]);
            store.uploadFile(store.files[1]);
            await flushPromises();

            expect(saveFileMock).toHaveBeenCalledTimes(2);
            expect(store.files.map(f => f.fileStatus)).toEqual(["done", "done"]);
        });
    });

    describe("upload on create", () => {
        test("uploads each content right after its object is created, without a commit", async () => {
            mockFlags.UPLOAD_ON_CREATE = true;
            const uploadAction = actionValue(true, false);
            const { store } = buildStore({ uploadAction });

            store.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);
            await flushPromises();

            expect(saveFileMock).toHaveBeenCalledTimes(2);
            expect(store.files.map(f => f.fileStatus)).toEqual(["done", "done"]);
            expect(uploadAction.execute).toHaveBeenCalled();
        });
    });
});
