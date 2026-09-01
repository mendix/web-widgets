import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormEvent } from "react";
import { FileUploaderContainerProps } from "../../../typings/FileUploaderProps";
import { FileStore } from "../../stores/FileStore";
import { TranslationsStoreProvider } from "../../utils/useTranslationsStore";
import { RetryButton } from "../RetryButton";

jest.mock("../../utils/mx-data", () => ({
    fetchDocumentUrl: jest.fn(),
    fetchImageThumbnail: jest.fn(),
    fetchMxObject: jest.fn(),
    removeObject: jest.fn(),
    saveFile: jest.fn(),
    fileHasContents: jest.fn()
}));

function makeFakeProps(): FileUploaderContainerProps {
    return {
        name: "fileUploader1",
        retryButtonTextMessage: { value: "Retry upload", status: "available" }
    } as unknown as FileUploaderContainerProps;
}

function renderInForm(): { onSubmit: jest.Mock; retry: jest.Mock } {
    const retry = jest.fn();
    const store = { canRetry: true, retry } as unknown as FileStore;
    const onSubmit = jest.fn((e: FormEvent) => e.preventDefault());

    render(
        <TranslationsStoreProvider props={makeFakeProps()}>
            <form onSubmit={onSubmit}>
                <RetryButton store={store} />
            </form>
        </TranslationsStoreProvider>
    );

    return { onSubmit, retry };
}

describe("RetryButton", () => {
    it("declares an explicit button type", () => {
        renderInForm();

        expect(screen.getByRole("button", { name: "Retry upload" })).toHaveAttribute("type", "button");
    });

    it("retries the upload without submitting an enclosing form", () => {
        const { onSubmit, retry } = renderInForm();

        fireEvent.click(screen.getByRole("button", { name: "Retry upload" }));

        expect(retry).toHaveBeenCalledTimes(1);
        expect(onSubmit).not.toHaveBeenCalled();
    });
});
