import { Big } from "big.js";
import { DynamicValue } from "mendix";
import { actionValue, dynamic, ListValueBuilder, obj } from "@mendix/widget-plugin-test-utils";

function unavailableDynamic(): DynamicValue<Big> {
    return { status: "unavailable", value: undefined } as unknown as DynamicValue<Big>;
}
import { FileUploaderContainerProps } from "../../../typings/FileUploaderProps";
import { FileUploaderStore } from "../FileUploaderStore";
import { TranslationsStore } from "../TranslationsStore";

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
        maxFilesPerUpload: dynamic(new Big(2)),
        maxFileSize: 25,
        objectCreationTimeout: 10,
        dropzoneIdleMessage: dynamic("Drag and drop files here"),
        dropzoneAcceptedMessage: dynamic("All files can be uploaded."),
        dropzoneRejectedMessage: dynamic("Some files may not be uploadable."),
        uploadInProgressMessage: dynamic("Uploading..."),
        uploadSuccessMessage: dynamic("Uploaded successfully."),
        uploadFailureGenericMessage: dynamic("An error occurred during uploading."),
        uploadFailureInvalidFileFormatMessage: dynamic("File format is not supported, supported formats are ###."),
        uploadFailureFileIsTooBigMessage: dynamic("File size exceeds the maximum limit of ### megabytes."),
        uploadFailureTooManyFilesMessage: dynamic("Too many files added. Only ### files per upload are allowed."),
        uploadLimitReachedMessage: dynamic("Maximum file count of ### reached."),
        unavailableCreateActionMessage: dynamic(
            "Can't upload files at this time. Please contact your system administrator."
        ),
        downloadButtonTextMessage: dynamic("Download this file"),
        removeButtonTextMessage: dynamic("Remove this file"),
        removeSuccessMessage: dynamic("Removed successfully."),
        removeErrorMessage: dynamic("An error occurred while removing this file."),
        enableCustomButtons: false,
        customButtons: [],
        onUploadSuccessFile: undefined,
        onUploadSuccessImage: undefined,
        onUploadFailureFile: undefined,
        onUploadFailureImage: undefined,
        ...overrides
    };
}

function buildStore(overrides: Partial<FileUploaderContainerProps> = {}): FileUploaderStore {
    const props = buildProps(overrides);
    const translations = new TranslationsStore(props);
    return new FileUploaderStore(props, translations);
}

describe("FileUploaderStore.warningMessage", () => {
    test("returns undefined when no limit set and no error", () => {
        const store = buildStore({ maxFilesPerUpload: unavailableDynamic() });
        expect(store.warningMessage).toBeUndefined();
    });

    test("returns undefined when under limit and no error", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(5)) });
        expect(store.warningMessage).toBeUndefined();
    });

    test("returns limit-reached message when file limit is reached", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        store.files.push(
            { fileStatus: "existingFile", _objectItem: obj("a") } as any,
            { fileStatus: "existingFile", _objectItem: obj("b") } as any
        );

        expect(store.isFileUploadLimitReached).toBe(true);
        expect(store.warningMessage).toBe("Maximum file count of 2 reached.");
    });

    test("returns errorMessage when limit not reached but error set", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(5)) });
        store.setMessage("Some other error");

        expect(store.warningMessage).toBe("Some other error");
    });

    test("clears limit-reached message when file removed below limit", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        const fileA = { fileStatus: "existingFile", _objectItem: obj("a") } as any;
        const fileB = { fileStatus: "existingFile", _objectItem: obj("b") } as any;
        store.files.push(fileA, fileB);

        expect(store.warningMessage).toBe("Maximum file count of 2 reached.");

        store.files.splice(store.files.indexOf(fileA), 1);

        expect(store.isFileUploadLimitReached).toBe(false);
        expect(store.warningMessage).toBeUndefined();
    });
});

describe("FileUploaderStore.isFileUploadLimitReached", () => {
    test("returns false when maxFilesPerUpload is 0 (unlimited)", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(0)) });

        store.files.push(
            { fileStatus: "existingFile" } as any,
            { fileStatus: "existingFile" } as any,
            { fileStatus: "existingFile" } as any
        );

        expect(store.isFileUploadLimitReached).toBe(false);
    });

    test("returns false when maxFilesPerUpload expression is unavailable (unlimited fallback)", () => {
        const store = buildStore({ maxFilesPerUpload: unavailableDynamic() });

        store.files.push({ fileStatus: "existingFile" } as any);

        expect(store.isFileUploadLimitReached).toBe(false);
    });

    test("excludes missing, removedFile, and validationError from active count", () => {
        const store = buildStore({ maxFilesPerUpload: dynamic(new Big(2)) });

        store.files.push(
            { fileStatus: "existingFile" } as any,
            { fileStatus: "missing" } as any,
            { fileStatus: "removedFile" } as any,
            { fileStatus: "validationError" } as any
        );

        expect(store.isFileUploadLimitReached).toBe(false);
    });
});
