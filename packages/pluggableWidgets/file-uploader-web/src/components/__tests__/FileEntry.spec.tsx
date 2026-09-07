import "@testing-library/jest-dom";
import { Big } from "big.js";
import { fireEvent, render } from "@testing-library/react";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { FileUploaderContainerProps } from "../../../typings/FileUploaderProps";
import { FileStore } from "../../stores/FileStore";
import { TranslationsStoreProvider } from "../../utils/useTranslationsStore";
import { FileEntryContainer } from "../FileEntry";

jest.mock("../../utils/mx-data", () => ({
    fetchDocumentUrl: jest.fn(),
    fetchImageThumbnail: jest.fn(),
    fetchMxObject: jest.fn(),
    removeObject: jest.fn(),
    saveFile: jest.fn(),
    fileHasContents: jest.fn()
}));

jest.mock("../../utils/useRootStore", () => ({
    useRootStore: () => ({ maxTotalFiles: 5, isReadOnly: false })
}));

function makeFakeProps(): FileUploaderContainerProps {
    return {
        name: "fileUploader1",
        uploadMode: "images",
        maxFileSize: 10,
        maxFilesPerUpload: dynamic.available(new Big(5)),
        readOnlyMode: false,
        objectCreationTimeout: 30,
        allowedFileFormats: "",
        removeButtonTextMessage: dynamic.available("Remove"),
        downloadButtonTextMessage: dynamic.available("Download"),
        unavailableCreateActionMessage: dynamic.available("Unavailable"),
        uploadFailureTooManyFilesMessage: dynamic.available("Too many"),
        uploadFailureInvalidFileFormatMessage: dynamic.available("Invalid format"),
        uploadFailureFileIsTooBigMessage: dynamic.available("Too big")
    } as unknown as FileUploaderContainerProps;
}

function makeImageStore(thumbnailUrl: string): FileStore {
    const rootStore = {
        dismissFile: jest.fn(),
        _uploadMode: "images",
        uploadMode: "images",
        isReadOnly: false,
        isFileUploadLimitReached: false
    } as any;
    const store = FileStore.newFile(new File([], "img.jpg"), rootStore);
    (store as any)._thumbnailUrl = thumbnailUrl;
    (store as any)._documentUrl = "http://host/doc.jpg";
    return store;
}

function renderWithTranslations(store: FileStore): ReturnType<typeof render> {
    const props = makeFakeProps();
    return render(
        <TranslationsStoreProvider props={props}>
            <FileEntryContainer store={store} />
        </TranslationsStoreProvider>
    );
}

describe("FileEntryContainer thumbnail onError", () => {
    it("calls store.handleThumbnailError() when the img fires an error event", () => {
        const store = makeImageStore("http://cdn/thumb.jpg");
        const spy = jest.spyOn(store, "handleThumbnailError");

        const { container } = renderWithTranslations(store);

        // img has alt="" so RTL assigns role "presentation" — query directly
        const img = container.querySelector("img.image-preview")!;
        expect(img).not.toBeNull();
        fireEvent.error(img);

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("does not render an img when no thumbnail is set", () => {
        const rootStore = {
            dismissFile: jest.fn(),
            _uploadMode: "images",
            uploadMode: "images",
            isReadOnly: false,
            isFileUploadLimitReached: false
        } as any;
        const store = FileStore.newFile(new File([], "doc.pdf"), rootStore);

        const { container } = renderWithTranslations(store);

        expect(container.querySelector("img.image-preview")).toBeNull();
    });
});
