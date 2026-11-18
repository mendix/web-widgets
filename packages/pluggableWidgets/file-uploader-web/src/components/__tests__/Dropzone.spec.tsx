import "@testing-library/jest-dom";
import { act, fireEvent, render } from "@testing-library/react";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { FileUploaderContainerProps } from "../../../typings/FileUploaderProps";
import { TranslationsStoreProvider } from "../../utils/useTranslationsStore";
import { MimeCheckFormat } from "../../utils/parseAllowedFormats";
import { Dropzone } from "../Dropzone";

const translationProps = {
    dropzoneIdleMessage: dynamic.available("Drag and drop files here"),
    dropzoneAcceptedMessage: dynamic.available("All files can be uploaded."),
    dropzoneRejectedMessage: dynamic.available("Some files may not be uploadable.")
} as unknown as FileUploaderContainerProps;

async function dropFiles(accept: MimeCheckFormat, files: File[]): Promise<jest.Mock> {
    const onDrop = jest.fn();
    const { container } = render(
        <TranslationsStoreProvider props={translationProps}>
            <Dropzone onDrop={onDrop} maxSize={0} acceptFileTypes={accept} disabled={false} />
        </TranslationsStoreProvider>
    );
    await act(async () => {
        fireEvent.drop(container.querySelector(".dropzone")!, {
            dataTransfer: {
                files,
                items: files.map(f => ({ kind: "file", type: f.type, getAsFile: () => f })),
                types: ["Files"]
            }
        });
    });
    return onDrop;
}

describe("Dropzone", () => {
    it.each([
        ["app.log", { "text/*": [] }],
        ["config.yaml", { "text/*": [] }],
        ["song.flac", { "audio/*": [] }],
        ["movie.mkv", { "video/*": [] }],
        ["letter.odt", { "application/vnd.oasis.opendocument.text": [] }]
    ])("accepts %s when the browser gives no MIME type", async (name, accept) => {
        const onDrop = await dropFiles(accept, [new File(["x"], name, { type: "" })]);

        expect(onDrop).toHaveBeenCalledTimes(1);
        const [accepted, rejected] = onDrop.mock.calls[0];
        expect(accepted.map((f: File) => f.name)).toEqual([name]);
        expect(rejected).toEqual([]);
    });

    it("still rejects a file of another type", async () => {
        const onDrop = await dropFiles({ "audio/*": [] }, [new File(["x"], "notes.log", { type: "" })]);

        const [accepted, rejected] = onDrop.mock.calls[0];
        expect(accepted).toEqual([]);
        expect(rejected).toHaveLength(1);
    });
});
