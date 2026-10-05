import "@testing-library/jest-dom";
import { act, render } from "@testing-library/react";
import { Big } from "big.js";
import { actionValue, dynamic, ListValueBuilder, obj } from "@mendix/widget-plugin-test-utils";
import { FileUploaderContainerProps } from "../../../typings/FileUploaderProps";
import { FileStore } from "../../stores/FileStore";
import { FileUploaderStore } from "../../stores/FileUploaderStore";
import { TranslationsStore } from "../../stores/TranslationsStore";
import { TranslationsStoreProvider } from "../../utils/useTranslationsStore";
import { FileUploaderRoot } from "../FileUploaderRoot";

jest.mock("../../utils/mx-data", () => ({
    fetchDocumentUrl: jest.fn(),
    fetchImageThumbnail: jest.fn(),
    fetchMxObject: jest.fn(),
    removeObject: jest.fn(),
    saveFile: jest.fn(),
    fileHasContents: jest.fn()
}));

let mockRootStore: FileUploaderStore;

jest.mock("../../utils/useRootStore", () => ({
    useRootStore: () => mockRootStore
}));

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
        maxFilesPerUpload: dynamic.available(new Big(5)),
        maxFilesPerBatch: dynamic.available(new Big(0)),
        maxFileSize: 25,
        objectCreationTimeout: 10,
        dropzoneIdleMessage: dynamic.available("Drag and drop files here"),
        dropzoneAcceptedMessage: dynamic.available("All files can be uploaded."),
        dropzoneRejectedMessage: dynamic.available("Some files may not be uploadable."),
        uploadInProgressMessage: dynamic.available("Uploading..."),
        uploadQueuedMessage: dynamic.available("Waiting..."),
        uploadSuccessMessage: dynamic.available("Uploaded successfully."),
        uploadFailureGenericMessage: dynamic.available("An error occurred during uploading."),
        uploadFailureInvalidFileFormatMessage: dynamic.available("File format is not supported."),
        uploadFailureFileIsTooBigMessage: dynamic.available("File is too big."),
        uploadFailureTooManyFilesMessage: dynamic.available("Too many files added."),
        uploadLimitReachedMessage: dynamic.available("Maximum file count of ### reached."),
        unavailableCreateActionMessage: dynamic.available("Can't upload files at this time."),
        downloadButtonTextMessage: dynamic.available("Download this file"),
        removeButtonTextMessage: dynamic.available("Remove this file"),
        retryButtonTextMessage: dynamic.available("Retry upload"),
        removeSuccessMessage: dynamic.available("Removed successfully."),
        removeErrorMessage: dynamic.available("An error occurred while removing this file."),
        enableCustomButtons: false,
        customButtons: [],
        onUploadSuccessFile: undefined,
        onUploadSuccessImage: undefined,
        onUploadFailureFile: undefined,
        onUploadFailureImage: undefined,
        ...overrides
    };
}

function renderRoot(overrides: Partial<FileUploaderContainerProps> = {}): ReturnType<typeof render> {
    const props = buildProps(overrides);
    mockRootStore = new FileUploaderStore(props, new TranslationsStore(props));
    return render(
        <TranslationsStoreProvider props={props}>
            <FileUploaderRoot {...props} />
        </TranslationsStoreProvider>
    );
}

describe("FileUploaderRoot live region", () => {
    it("renders one empty polite status region on initial render", () => {
        const { getAllByRole } = renderRoot();

        const regions = getAllByRole("status");
        expect(regions).toHaveLength(1);
        expect(regions[0]).toHaveAttribute("aria-live", "polite");
        expect(regions[0]).toHaveAttribute("aria-atomic", "true");
        expect(regions[0]).toHaveClass("sr-only");
        expect(regions[0]).toBeEmptyDOMElement();
    });

    it("renders the region in read-only mode", () => {
        const { getAllByRole } = renderRoot({ readOnlyMode: true });

        expect(getAllByRole("status")).toHaveLength(1);
    });

    it("shows the announced text", () => {
        const { getByRole } = renderRoot();

        act(() => mockRootStore.announce("uploadLimitReachedMessage", "5"));

        expect(getByRole("status")).toHaveTextContent("Maximum file count of 5 reached.");
    });

    it("changes its content when the same message is announced twice", () => {
        const { getByRole } = renderRoot();

        act(() => mockRootStore.announce("uploadSuccessMessage"));
        const first = getByRole("status").textContent;
        act(() => mockRootStore.announce("uploadSuccessMessage"));
        const second = getByRole("status").textContent;

        expect(first).not.toBe(second);
        expect(first!.trim()).toBe("Uploaded successfully.");
        expect(second!.trim()).toBe("Uploaded successfully.");
    });

    it("does not add live regions to file entries", () => {
        const { container } = renderRoot();

        act(() => {
            mockRootStore.files.push(
                new FileStore("done", mockRootStore, new File([""], "a.txt")),
                new FileStore("uploadingError", mockRootStore, new File([""], "b.txt")),
                new FileStore("rejected", mockRootStore, new File([""], "c.txt"))
            );
        });

        expect(container.querySelectorAll(".file-entry")).toHaveLength(3);
        expect(container.querySelectorAll(".files-list [aria-live], .files-list [role=status]")).toHaveLength(0);
    });

    it("never shows the removal text in the file list", () => {
        const { container } = renderRoot();
        const failed = new FileStore("uploadingError", mockRootStore, new File([""], "a.txt"), obj("a") as any);
        const removed = new FileStore("done", mockRootStore, new File([""], "b.txt"), obj("b") as any);

        act(() => {
            mockRootStore.files.push(failed, removed);
        });
        act(() => {
            failed.markMissing();
            removed.markMissing();
        });

        const list = container.querySelector(".files-list")!;
        expect(list).not.toHaveTextContent("Removed successfully.");
        expect(list).toHaveTextContent("An error occurred during uploading.");
        expect(container.querySelector("[role=status]")).toHaveTextContent("Removed successfully.");
    });
});
