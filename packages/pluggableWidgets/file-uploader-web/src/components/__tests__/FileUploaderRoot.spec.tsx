import "@testing-library/jest-dom";
import { act, fireEvent, render } from "@testing-library/react";
import { actionValue } from "@mendix/widget-plugin-test-utils";
import { FileUploaderContainerProps } from "../../../typings/FileUploaderProps";
import { buildProps, creatableList, flushPromises, makeFile } from "../../__tests__/testProps";
import { FileUploaderStore } from "../../stores/FileUploaderStore";
import { TranslationsStore } from "../../stores/TranslationsStore";
import { TranslationsStoreProvider } from "../../utils/useTranslationsStore";
import { FileUploaderRoot } from "../FileUploaderRoot";

jest.mock("../../utils/mx-data", () => ({
    saveFile: jest.fn()
}));

let mockRootStore: FileUploaderStore;

jest.mock("../../utils/useRootStore", () => ({
    useRootStore: () => mockRootStore
}));

function renderRoot(overrides: Partial<FileUploaderContainerProps> = {}): ReturnType<typeof render> {
    const props = buildProps(overrides);
    mockRootStore = new FileUploaderStore(props, new TranslationsStore(props));
    return render(
        <TranslationsStoreProvider props={props}>
            <FileUploaderRoot {...props} />
        </TranslationsStoreProvider>
    );
}

describe("FileUploaderRoot", () => {
    describe("Upload button", () => {
        test("is disabled without files", () => {
            const { getByRole } = renderRoot();

            expect(getByRole("button", { name: "Upload" })).toBeDisabled();
        });

        test("is enabled once a file is ready and runs the upload action", async () => {
            const uploadAction = actionValue(true, false);
            const { getByRole } = renderRoot({ uploadAction });

            await act(async () => {
                mockRootStore.processDrop([makeFile()], []);
                await flushPromises();
            });

            const button = getByRole("button", { name: "Upload" });
            expect(button).toBeEnabled();

            fireEvent.click(button);

            expect(uploadAction.execute).toHaveBeenCalledTimes(1);
            expect(button).toBeDisabled();
        });
    });

    test("shows the unavailable message when files can't be created", () => {
        jest.spyOn(console, "error").mockImplementation(() => {});
        const { container } = renderRoot({ files: creatableList("unavailable") });

        act(() => {
            mockRootStore.processDrop([makeFile()], []);
        });

        expect(container.querySelector(".dropzone")).toHaveTextContent("Can't upload files at this time.");
    });

    describe("live region", () => {
        test("renders one empty polite status region on initial render", () => {
            const { getAllByRole } = renderRoot();

            const regions = getAllByRole("status");
            expect(regions).toHaveLength(1);
            expect(regions[0]).toHaveAttribute("aria-live", "polite");
            expect(regions[0]).toHaveAttribute("aria-atomic", "true");
            expect(regions[0]).toHaveClass("sr-only");
            expect(regions[0]).toBeEmptyDOMElement();
        });

        test("changes its content when the same message is announced twice", () => {
            const { getByRole } = renderRoot();

            act(() => mockRootStore.announce("uploadSuccessMessage"));
            const first = getByRole("status").textContent;
            act(() => mockRootStore.announce("uploadSuccessMessage"));
            const second = getByRole("status").textContent;

            expect(first).not.toBe(second);
            expect(first!.trim()).toBe("Uploaded successfully.");
            expect(second!.trim()).toBe("Uploaded successfully.");
        });

        test("file entries have no live regions of their own", async () => {
            const { container } = renderRoot();

            await act(async () => {
                mockRootStore.processDrop([makeFile("a.txt"), makeFile("b.txt")], []);
                await flushPromises();
            });

            expect(container.querySelectorAll(".file-entry")).toHaveLength(2);
            expect(container.querySelectorAll(".files-list [aria-live], .files-list [role=status]")).toHaveLength(0);
        });
    });
});
