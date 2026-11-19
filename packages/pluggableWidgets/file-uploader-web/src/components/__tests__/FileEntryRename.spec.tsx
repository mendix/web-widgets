import "@testing-library/jest-dom";
import { Big } from "big.js";
import { ObjectItem } from "mendix";
import { act, render, waitFor } from "@testing-library/react";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { FileUploaderContainerProps } from "../../../typings/FileUploaderProps";
import { FileStore } from "../../stores/FileStore";
import { FileUploaderStore } from "../../stores/FileUploaderStore";
import { TranslationsStoreProvider } from "../../utils/useTranslationsStore";
import { FileEntryContainer } from "../FileEntry";

jest.mock("../../utils/useRootStore", () => ({
    useRootStore: () => ({ maxTotalFiles: 5, isReadOnly: false })
}));

// Mendix may update an object in place rather than return a new instance.
class FileObject {
    name = "original.txt";

    get2(attribute: string): string | Big {
        return attribute === "Name" ? this.name : new Big(10);
    }
}

describe("FileEntryContainer external rename", () => {
    const item = { id: "file-1" } as ObjectItem;
    let object: FileObject;
    let subscriptions: Map<number, { guid: string; attr: string; callback: () => void }>;
    let unsubscribe: jest.Mock;

    beforeEach(() => {
        object = new FileObject();
        subscriptions = new Map();
        let nextHandle = 0;
        unsubscribe = jest.fn(handle => subscriptions.delete(handle));
        (window as any).mx = {
            data: {
                get: jest.fn(({ callback }) => callback(object)),
                saveDocument: jest.fn((_id, _name, _meta, _file, resolve) => resolve()),
                subscribe: jest.fn(args => {
                    const handle = nextHandle++;
                    subscriptions.set(handle, args);
                    return handle;
                }),
                unsubscribe
            }
        };
    });

    afterEach(() => {
        (window as any).mx = undefined;
    });

    it.each(["existing", "uploaded"])(
        "updates an %s file's visible name and cleans up its subscription",
        async type => {
            const rootStore = {
                uploadMode: "files",
                isReadOnly: false,
                announce: jest.fn(),
                objectCreationHelper: {
                    request: jest.fn().mockResolvedValue(item),
                    reportUploadSuccess: jest.fn()
                }
            } as unknown as FileUploaderStore;
            const store =
                type === "existing"
                    ? FileStore.existingFile(item, rootStore)
                    : FileStore.newFile(new File(["content"], "original.txt"), rootStore);
            const props = {
                removeButtonTextMessage: dynamic.available("Remove"),
                downloadButtonTextMessage: dynamic.available("Download"),
                uploadQueuedMessage: dynamic.available("Waiting"),
                uploadInProgressMessage: dynamic.available("Uploading"),
                uploadSuccessMessage: dynamic.available("Uploaded")
            } as FileUploaderContainerProps;
            const { container, unmount } = render(
                <TranslationsStoreProvider props={props}>
                    <FileEntryContainer store={store} />
                </TranslationsStoreProvider>
            );

            if (type === "uploaded") {
                await act(async () => store.upload());
            }
            const name = container.querySelector(".entry-details-main-name")!;
            await waitFor(() => expect(name).toHaveTextContent("original.txt"));
            await waitFor(() => expect(subscriptions.size).toBe(1));

            const subscription = [...subscriptions.values()][0];
            expect(subscription).toMatchObject({ guid: item.id, attr: "Name" });
            await act(async () => {
                object.name = "renamed.pdf";
                subscription.callback();
            });

            await waitFor(() => expect(name).toHaveTextContent("renamed.pdf"));
            expect(container.querySelector(".file-entry")).toHaveAttribute("title", "renamed.pdf");
            expect(store.mimeType).toBe("application/pdf");

            await act(async () => {
                object.name = "original.txt";
                subscription.callback();
            });
            await waitFor(() => expect(name).toHaveTextContent("original.txt"));
            expect(subscriptions.size).toBe(1);

            unmount();
            expect(unsubscribe).toHaveBeenCalledTimes(1);
            expect(subscriptions.size).toBe(0);
        }
    );
});
