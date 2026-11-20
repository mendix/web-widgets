import { Big } from "big.js";
import { ActionValue, ListActionValue, ListValue, ObjectItem } from "mendix";
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

export type MockListAction = ListActionValue & {
    get: jest.Mock<ActionValue, [ObjectItem]>;
    /** Sets the value returned for every item from now on, as on new props. */
    setState: (canExecute: boolean, isExecuting: boolean) => void;
    /** Every value of the action that was executed, in order. */
    executed: ObjectItem[];
};

/** A linked action (`dataSource="files"`). Each `get(item)` returns the current state; `execute` records the item. */
export function mockListAction(canExecute = true): MockListAction {
    const state = { canExecute, isExecuting: false };
    const executed: ObjectItem[] = [];
    const get = jest.fn((item: ObjectItem) => {
        const value = actionValue(state.canExecute, state.isExecuting);
        (value.execute as jest.Mock).mockImplementation(() => executed.push(item));
        return value;
    });
    return {
        get,
        executed,
        setState: (c: boolean, e: boolean) => {
            state.canExecute = c;
            state.isExecuting = e;
        }
    } as unknown as MockListAction;
}
