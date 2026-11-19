import "@testing-library/jest-dom";
import { fireEvent, render } from "@testing-library/react";
import { obj } from "@mendix/widget-plugin-test-utils";
import { buildProps, makeFile } from "../../__tests__/testProps";
import { FileStore } from "../../stores/FileStore";
import { TranslationsStoreProvider } from "../../utils/useTranslationsStore";
import { FileEntryContainer } from "../FileEntry";

jest.mock("../../utils/mx-data", () => ({
    saveFile: jest.fn()
}));

const dismissFile = jest.fn();

jest.mock("../../utils/useRootStore", () => ({
    useRootStore: () => ({ maxTotalFiles: 5, dismissFile })
}));

function renderEntry(store: FileStore): ReturnType<typeof render> {
    return render(
        <TranslationsStoreProvider props={buildProps()}>
            <FileEntryContainer store={store} />
        </TranslationsStoreProvider>
    );
}

describe("FileEntry", () => {
    beforeEach(() => {
        dismissFile.mockReset();
    });

    test("shows name, size and the ready message for a pending file", () => {
        const store = FileStore.newFile(makeFile("report.txt", "12345"));
        store.setCreated(obj("a"));

        const { container } = renderEntry(store);

        expect(container.querySelector(".entry-details-main-name")).toHaveTextContent("report.txt");
        expect(container.querySelector(".entry-details-main-size")).not.toBeEmptyDOMElement();
        expect(container.querySelector(".upload-status")).toHaveTextContent("Ready to upload.");
    });

    test("has no remove button for a pending file", () => {
        const store = FileStore.newFile(makeFile());
        store.setCreated(obj("a"));

        const { queryByRole } = renderEntry(store);

        expect(queryByRole("button")).not.toBeInTheDocument();
    });

    test("a rejected file can be removed from the list", () => {
        const store = FileStore.newFileWithValidationError(makeFile("bad.exe"), "bad format");

        const { getByRole } = renderEntry(store);
        fireEvent.click(getByRole("button", { name: "Remove this file" }));

        expect(dismissFile).toHaveBeenCalledWith(store);
    });

    test("shows the progress bar while uploading", () => {
        const store = FileStore.newFile(makeFile());
        store.setCreated(obj("a"));
        store.setUploading();

        const { container } = renderEntry(store);

        expect(container.querySelector(".upload-status")).toHaveTextContent("Uploading...");
    });
});
