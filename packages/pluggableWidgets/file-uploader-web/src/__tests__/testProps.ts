import { Big } from "big.js";
import { ListValue, ObjectItem } from "mendix";
import { actionValue, dynamic, ListValueBuilder, obj } from "@mendix/widget-plugin-test-utils";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { CreatableListValue } from "../utils/creatableListValue";

export type MockCreatableList = CreatableListValue & { create: jest.Mock<Promise<ObjectItem>, []> };

/** A `files` datasource that supports `create()`. By default every call resolves with a new object. */
export function creatableList(canCreate: CreatableListValue["canCreate"] = "available"): MockCreatableList {
    let counter = 0;
    return Object.assign(new ListValueBuilder().withItems([]).build(), {
        canCreate,
        createdItems: [],
        create: jest.fn(() => Promise.resolve(obj(`new${counter++}`)))
    }) as MockCreatableList;
}

export function plainList(): ListValue {
    return new ListValueBuilder().withItems([]).build();
}

export function buildProps(overrides: Partial<FileUploaderContainerProps> = {}): FileUploaderContainerProps {
    return {
        name: "fileUploader1",
        class: "",
        style: undefined,
        tabIndex: 0,
        files: creatableList(),
        uploadAction: actionValue(true, false),
        allowedFileFormats: [],
        maxFilesPerUpload: dynamic.available(new Big(5)),
        maxFileSize: 25,
        dropzoneIdleMessage: dynamic.available("Drag and drop files here"),
        dropzoneAcceptedMessage: dynamic.available("All files can be uploaded."),
        dropzoneRejectedMessage: dynamic.available("Some files may not be uploadable."),
        uploadButtonCaptionMessage: dynamic.available("Upload"),
        uploadPendingMessage: dynamic.available("Ready to upload."),
        uploadInProgressMessage: dynamic.available("Uploading..."),
        uploadSuccessMessage: dynamic.available("Uploaded successfully."),
        uploadFailureGenericMessage: dynamic.available("An error occurred during uploading."),
        uploadFailureInvalidFileFormatMessage: dynamic.available(
            "File format is not supported, supported formats are ###."
        ),
        uploadFailureFileIsTooBigMessage: dynamic.available("File size exceeds the maximum limit of ### megabytes."),
        uploadFailureTooManyFilesMessage: dynamic.available(
            "Too many files added. Only ### files per upload are allowed."
        ),
        uploadLimitReachedMessage: dynamic.available("Maximum file count of ### reached."),
        unavailableCreateActionMessage: dynamic.available(
            "Can't upload files at this time. Please contact your system administrator."
        ),
        removeButtonTextMessage: dynamic.available("Remove this file"),
        uploadActionTimeout: 10,
        ...overrides
    };
}

export function makeFile(name = "a.txt", content = "data"): File {
    return new File([content], name, { type: "text/plain" });
}

/** Resolves after pending promise callbacks have run. Works with fake timers. */
export function flushPromises(): Promise<void> {
    return new Promise(resolve => jest.requireActual("timers").setImmediate(resolve));
}
