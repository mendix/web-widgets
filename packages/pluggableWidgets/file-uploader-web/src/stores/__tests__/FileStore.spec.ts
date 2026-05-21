import { FileStore } from "../FileStore";
import { FileUploaderStore } from "../FileUploaderStore";
import * as mxData from "../../utils/mx-data";

jest.mock("../../utils/mx-data", () => ({
    fetchDocumentUrl: jest.fn(),
    fetchImageThumbnail: jest.fn(),
    fetchMxObject: jest.fn(),
    removeObject: jest.fn(),
    saveFile: jest.fn(),
    fileHasContents: jest.fn()
}));

function makeRootStore(): { dismissFile: jest.Mock; dismissValidationErrors: jest.Mock } {
    return {
        dismissFile: jest.fn(),
        dismissValidationErrors: jest.fn(),
        objectCreationHelper: {
            canCreateFiles: true,
            request: jest.fn().mockResolvedValue({ id: "obj-1" }),
            reportUploadSuccess: jest.fn(),
            reportUploadFailure: jest.fn()
        },
        _uploadMode: "files",
        isReadOnly: false
    } as unknown as FileUploaderStore & { dismissFile: jest.Mock; dismissValidationErrors: jest.Mock };
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

describe("FileStore.upload()", () => {
    it("does not call dismissValidationErrors on successful upload", async () => {
        const rootStore = makeRootStore();
        (mxData.saveFile as jest.Mock).mockResolvedValue(undefined);
        (mxData.fetchMxObject as jest.Mock).mockResolvedValue({ get2: jest.fn(() => "name.pdf") });

        const store = FileStore.newFile(new File(["content"], "good.pdf"), rootStore as any);
        await store.upload();

        expect(rootStore.dismissValidationErrors).not.toHaveBeenCalled();
    });
});
