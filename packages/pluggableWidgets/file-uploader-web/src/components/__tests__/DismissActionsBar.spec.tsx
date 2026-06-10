import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FileUploaderContainerProps } from "../../../typings/FileUploaderProps";
import { FileStore } from "../../stores/FileStore";
import { TranslationsStoreProvider } from "../../utils/useTranslationsStore";
import { ActionsBar } from "../ActionsBar";

jest.mock("../../utils/mx-data", () => ({
    fetchDocumentUrl: jest.fn(),
    fetchImageThumbnail: jest.fn(),
    fetchMxObject: jest.fn(),
    removeObject: jest.fn(),
    saveFile: jest.fn(),
    fileHasContents: jest.fn()
}));

function makeFakeProps(): FileUploaderContainerProps {
    const dv = (v: string): { value: string; status: string } => ({ value: v, status: "available" });
    return {
        name: "fileUploader1",
        uploadMode: "files",
        maxFileSize: 10,
        maxFilesPerUpload: { value: { toNumber: () => 5 } },
        readOnlyMode: false,
        objectCreationTimeout: 30,
        allowedFileFormats: "",
        removeButtonTextMessage: dv("Remove"),
        downloadButtonTextMessage: dv("Download"),
        unavailableCreateActionMessage: dv("Unavailable"),
        uploadFailureTooManyFilesMessage: dv("Too many"),
        uploadFailureInvalidFileFormatMessage: dv("Invalid format"),
        uploadFailureFileIsTooBigMessage: dv("Too big")
    } as unknown as FileUploaderContainerProps;
}

function makeValidationErrorStore(): { store: FileStore; dismiss: jest.Mock } {
    const dismiss = jest.fn();
    const rootStore = { dismissFile: dismiss, _uploadMode: "files", isReadOnly: false } as any;
    const store = FileStore.newFileWithValidationError(new File([], "bad.txt"), "bad format", rootStore);
    return { store, dismiss };
}

function renderWithTranslations(store: FileStore): void {
    const props = makeFakeProps();
    render(
        <TranslationsStoreProvider props={props}>
            <ActionsBar store={store} />
        </TranslationsStoreProvider>
    );
}

describe("DismissActionsBar", () => {
    it("renders dismiss button for validationError file", () => {
        const { store } = makeValidationErrorStore();
        renderWithTranslations(store);
        expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    });

    it("calls store.dismiss() when button clicked", () => {
        const { store } = makeValidationErrorStore();
        const dismissSpy = jest.spyOn(store, "dismiss");
        renderWithTranslations(store);
        fireEvent.click(screen.getByRole("button"));
        expect(dismissSpy).toHaveBeenCalledTimes(1);
    });

    it("does not render DismissActionsBar for non-validationError file", () => {
        const rootStore = { dismissFile: jest.fn(), _uploadMode: "files", isReadOnly: false } as any;
        const store = FileStore.newFile(new File([], "ok.txt"), rootStore);
        (store as any).fileStatus = "done";
        renderWithTranslations(store);
        // DefaultActionsBar renders 2 buttons (download + remove)
        expect(screen.queryAllByRole("button")).toHaveLength(2);
    });
});
