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

function makeRootStore(): { dismissFile: jest.Mock } {
    return {
        dismissFile: jest.fn(),
        _uploadMode: "files",
        isReadOnly: false
    } as unknown as FileUploaderStore & { dismissFile: jest.Mock };
}

describe("FileStore.dismiss()", () => {
    it("calls dismissFile on root store with itself", () => {
        const rootStore = makeRootStore();
        const store = FileStore.newFileWithError(new File([], "test.txt"), "bad format", rootStore as any);
        store.dismiss();
        expect(rootStore.dismissFile).toHaveBeenCalledTimes(1);
        expect(rootStore.dismissFile).toHaveBeenCalledWith(store);
    });
});
