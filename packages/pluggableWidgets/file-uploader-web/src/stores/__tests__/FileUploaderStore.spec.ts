import { Big } from "big.js";
import { ActionValue } from "mendix";
import { FileRejection } from "react-dropzone";
import { actionValue, dynamic } from "@mendix/widget-plugin-test-utils";
import { FileUploaderContainerProps } from "../../../typings/FileUploaderProps";
import { buildProps, creatableList, flushPromises, makeFile, plainList } from "../../__tests__/testProps";
import { saveFile } from "../../utils/mx-data";
import { FileUploaderStore } from "../FileUploaderStore";
import { TranslationsStore } from "../TranslationsStore";

jest.mock("../../utils/mx-data", () => ({
    saveFile: jest.fn()
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

/** Simulates the platform re-rendering the widget with a new upload action value. */
function rerenderWithAction(store: FileUploaderStore, props: FileUploaderContainerProps, action: ActionValue): void {
    store.updateProps({ ...props, uploadAction: action });
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

        test("does not commit or upload on drop", async () => {
            const uploadAction = actionValue(true, false);
            const { store } = buildStore({ uploadAction });

            store.processDrop([makeFile()], []);
            await flushPromises();

            expect(uploadAction.execute).not.toHaveBeenCalled();
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

    describe("canUpload", () => {
        test("is false without pending files", () => {
            expect(buildStore().store.canUpload).toBe(false);
        });

        test("is false while a file is still being created", () => {
            const files = creatableList();
            files.create.mockReturnValue(new Promise(() => {}));
            const { store } = buildStore({ files });

            store.processDrop([makeFile()], []);

            expect(store.canUpload).toBe(false);
        });

        test("is false when the upload action can't execute", async () => {
            const { store } = buildStore({ uploadAction: actionValue(false, false) });
            store.processDrop([makeFile()], []);
            await flushPromises();

            expect(store.canUpload).toBe(false);
        });

        test("is true with pending files and an executable action", async () => {
            const { store } = buildStore();
            store.processDrop([makeFile()], []);
            await flushPromises();

            expect(store.canUpload).toBe(true);
        });
    });

    describe("upload", () => {
        async function storeWithPendingFiles(count: number): Promise<{
            store: FileUploaderStore;
            props: FileUploaderContainerProps;
            uploadAction: ActionValue;
        }> {
            const uploadAction = actionValue(true, false);
            const { store, props } = buildStore({ uploadAction });
            store.processDrop(
                Array.from({ length: count }, (_, i) => makeFile(`f${i}.txt`)),
                []
            );
            await flushPromises();
            return { store, props, uploadAction };
        }

        test("runs the action once, then uploads every file", async () => {
            const { store, props, uploadAction } = await storeWithPendingFiles(2);

            const uploading = store.upload();
            expect(uploadAction.execute).toHaveBeenCalledTimes(1);
            expect(store.isUploading).toBe(true);
            expect(store.files.map(f => f.fileStatus)).toEqual(["uploading", "uploading"]);
            expect(saveFileMock).not.toHaveBeenCalled();

            rerenderWithAction(store, props, actionValue(true, true));
            rerenderWithAction(store, props, actionValue(true, false));
            await uploading;

            expect(saveFileMock).toHaveBeenCalledTimes(2);
            expect(store.files.map(f => f.fileStatus)).toEqual(["done", "done"]);
            expect(store.isUploading).toBe(false);
            expect(store.announcement.text).toBe("Uploaded successfully.");
        });

        test("does not upload content before the action has finished", async () => {
            const { store, props } = await storeWithPendingFiles(1);

            store.upload();
            rerenderWithAction(store, props, actionValue(true, true));
            await flushPromises();

            expect(saveFileMock).not.toHaveBeenCalled();
        });

        test("fails all files when the action does not finish in time", async () => {
            jest.useFakeTimers();
            const { store } = await storeWithPendingFiles(2);

            const uploading = store.upload();
            jest.advanceTimersByTime(10001);
            await uploading;

            expect(saveFileMock).not.toHaveBeenCalled();
            expect(store.files.map(f => f.fileStatus)).toEqual(["uploadingError", "uploadingError"]);
            expect(store.isUploading).toBe(false);
        });

        test("continues with the other files when one content upload fails", async () => {
            const { store, props } = await storeWithPendingFiles(2);
            saveFileMock.mockRejectedValueOnce(new Error("network"));

            const uploading = store.upload();
            rerenderWithAction(store, props, actionValue(true, true));
            rerenderWithAction(store, props, actionValue(true, false));
            await uploading;

            expect(store.files.map(f => f.fileStatus).sort()).toEqual(["done", "uploadingError"]);
            expect(store.announcement.text).toBe("An error occurred during uploading.");
        });

        test("does nothing when nothing can be uploaded", async () => {
            const uploadAction = actionValue(true, false);
            const { store } = buildStore({ uploadAction });

            await store.upload();

            expect(uploadAction.execute).not.toHaveBeenCalled();
        });
    });
});
