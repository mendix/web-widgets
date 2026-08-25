import { FileStore } from "../FileStore";
import { FileUploaderStore } from "../FileUploaderStore";

jest.mock("../../utils/mx-data", () => ({
    fetchDocumentUrl: jest.fn(),
    fetchImageThumbnail: jest.fn(),
    fetchMxObject: jest.fn(),
    removeObject: jest.fn(),
    saveFile: jest.fn(),
    fileHasContents: jest.fn()
}));

function makeRootStore(uploadMode: "files" | "images" = "files"): FileUploaderStore & { dismissFile: jest.Mock } {
    return {
        dismissFile: jest.fn(),
        _uploadMode: uploadMode,
        uploadMode,
        isReadOnly: false
    } as unknown as FileUploaderStore & { dismissFile: jest.Mock };
}

describe("FileStore.dismiss()", () => {
    it("calls dismissFile on root store with itself", () => {
        const rootStore = makeRootStore();
        const store = FileStore.newFileWithValidationError(new File([], "test.txt"), "bad format", rootStore as any);
        store.dismiss();
        expect(rootStore.dismissFile).toHaveBeenCalledTimes(1);
        expect(rootStore.dismissFile).toHaveBeenCalledWith(store);
    });
});

describe("FileStore.imagePreviewUrl thumbnail fallback", () => {
    function makeImageStore(): FileStore {
        const rootStore = makeRootStore("images");
        const store = FileStore.newFile(new File([], "img.jpg"), rootStore as any);
        (store as any)._thumbnailUrl = "http://cdn/thumb.jpg";
        (store as any)._documentUrl = "http://host/doc.jpg";
        return store;
    }

    it("returns thumbnailUrl when no error has occurred", () => {
        const store = makeImageStore();
        expect(store.imagePreviewUrl).toBe("http://cdn/thumb.jpg");
    });

    it("returns documentUrl after handleThumbnailError()", () => {
        const store = makeImageStore();
        store.handleThumbnailError();
        expect(store.imagePreviewUrl).toBe("http://host/doc.jpg");
    });

    it("returns documentUrl on repeated handleThumbnailError() calls (no loop)", () => {
        const store = makeImageStore();
        store.handleThumbnailError();
        store.handleThumbnailError();
        expect(store.imagePreviewUrl).toBe("http://host/doc.jpg");
    });

    it("returns undefined in files uploadMode even after handleThumbnailError()", () => {
        const rootStore = makeRootStore("files");
        const store = FileStore.newFile(new File([], "doc.pdf"), rootStore as any);
        (store as any)._thumbnailUrl = "http://cdn/thumb.jpg";
        (store as any)._documentUrl = "http://host/doc.pdf";
        store.handleThumbnailError();
        expect(store.imagePreviewUrl).toBeUndefined();
    });
});
