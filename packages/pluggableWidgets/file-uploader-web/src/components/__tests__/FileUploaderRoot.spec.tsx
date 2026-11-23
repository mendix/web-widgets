import "@testing-library/jest-dom";
import { act, render } from "@testing-library/react";
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
    test("has no upload button of its own", () => {
        const { queryByRole } = renderRoot();

        expect(queryByRole("button", { name: "Upload" })).not.toBeInTheDocument();
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
