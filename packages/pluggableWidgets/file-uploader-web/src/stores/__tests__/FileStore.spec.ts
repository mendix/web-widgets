import { obj } from "@mendix/widget-plugin-test-utils";
import { makeFile } from "../../__tests__/testProps";
import { saveFile } from "../../utils/mx-data";
import { FileStore } from "../FileStore";

jest.mock("../../utils/mx-data", () => ({
    saveFile: jest.fn()
}));

const saveFileMock = saveFile as jest.Mock;

describe("FileStore", () => {
    beforeEach(() => {
        saveFileMock.mockReset();
    });

    test("a new file starts in 'creating' and uses the blob for name and size", () => {
        const store = FileStore.newFile(makeFile("report.pdf", "12345"));

        expect(store.fileStatus).toBe("creating");
        expect(store.title).toBe("report.pdf");
        expect(store.size).toBe(5);
        expect(store.mimeType).toBe("application/pdf");
    });

    test("setCreated stores the object and marks the file pending", () => {
        const store = FileStore.newFile(makeFile());
        store.setCreated(obj("a"));

        expect(store.fileStatus).toBe("pending");
        expect(store.objectItemId).toBe(obj("a").id);
    });

    test("only files without an object can be dismissed", () => {
        expect(FileStore.newFileWithValidationError(makeFile(), "bad").canDismiss).toBe(true);
        expect(FileStore.newRejectedFile(makeFile()).canDismiss).toBe(true);

        const pending = FileStore.newFile(makeFile());
        pending.setCreated(obj("a"));
        expect(pending.canDismiss).toBe(false);
    });

    test("keeps the validation error message", () => {
        expect(FileStore.newFileWithValidationError(makeFile(), "bad format").errorDescription).toBe("bad format");
    });

    describe("uploadContent", () => {
        function uploadingStore(): FileStore {
            const store = FileStore.newFile(makeFile("a.txt"));
            store.setCreated(obj("a"));
            store.setUploading();
            return store;
        }

        test("uploads the blob into the object and marks the file done", async () => {
            saveFileMock.mockResolvedValue(undefined);
            const store = uploadingStore();

            await expect(store.uploadContent()).resolves.toBe(true);

            expect(saveFileMock).toHaveBeenCalledWith(obj("a"), store.file);
            expect(store.fileStatus).toBe("done");
        });

        test("marks the file failed when the upload fails", async () => {
            saveFileMock.mockRejectedValue(new Error("network"));
            jest.spyOn(console, "warn").mockImplementation(() => {});
            const store = uploadingStore();

            await expect(store.uploadContent()).resolves.toBe(false);

            expect(store.fileStatus).toBe("uploadingError");
        });

        test("does nothing unless the file is uploading", async () => {
            const store = FileStore.newFile(makeFile());
            store.setCreated(obj("a"));

            await expect(store.uploadContent()).resolves.toBe(false);

            expect(saveFileMock).not.toHaveBeenCalled();
            expect(store.fileStatus).toBe("pending");
        });
    });
});
