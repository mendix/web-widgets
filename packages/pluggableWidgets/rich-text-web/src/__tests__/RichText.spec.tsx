import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ListValue } from "mendix";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { RichTextContainerProps, StatusBarContentEnum } from "../../typings/RichTextProps";

import { IMAGE_REQUEST_EVENT } from "../extensions/ImagePasteDrop";
import RichText from "../RichText";
const richTextDefaultValue = `<h2><strong>Rich text default value</strong></h2>`;
describe("Rich Text", () => {
    let defaultProps: RichTextContainerProps;
    beforeEach(() => {
        defaultProps = {
            name: "RichText",
            id: "RichText1",
            stringAttribute: new EditableValueBuilder<string>().withValue(richTextDefaultValue).build(),
            preset: "basic",
            toolbarLocation: "bottom",
            widthUnit: "percentage",
            width: 100,
            heightUnit: "percentageOfWidth",
            height: 75,
            toolbarConfig: "basic",
            history: true,
            fontStyle: true,
            fontScript: true,
            fontColor: true,
            code: true,
            indent: true,
            embed: true,
            align: true,
            list: true,
            remove: true,
            header: true,
            view: true,
            tableBetter: false,
            helpButton: true,
            advancedConfig: [],
            readOnlyStyle: "text",
            tabIndex: 0,
            onChangeType: "onLeave",
            enableStatusBar: true,
            dialogStyle: "inline",
            statusBarContent: "wordCount" as StatusBarContentEnum,
            spellCheck: true,
            minHeightUnit: "none",
            maxHeightUnit: "none",
            maxHeight: 0,
            minHeight: 75,
            OverflowY: "auto",
            customFonts: [],
            enableDefaultUpload: true,
            linkValidation: true,
            styleDataFormat: "inline"
        };
    });

    it("renders richtext widget", () => {
        const component = render(<RichText {...defaultProps} />);
        expect(component.container).toMatchSnapshot();
    });

    it("renders richtext widget with different config", () => {
        const component = render(<RichText {...defaultProps} toolbarLocation={"top"} preset={"full"} />);
        expect(component.container).toMatchSnapshot();
    });

    it("renders richtext widget with readonly config", async () => {
        const component = render(
            <RichText
                {...defaultProps}
                readOnlyStyle={"bordered"}
                stringAttribute={new EditableValueBuilder<string>()
                    .withValue(richTextDefaultValue)
                    .isReadOnly()
                    .build()}
            />
        );
        expect(component.container).toMatchSnapshot();
    });

    it("renders with character count status bar", () => {
        const component = render(
            <RichText {...defaultProps} statusBarContent={"characterCount" as StatusBarContentEnum} />
        );
        expect(component.container).toMatchSnapshot();
    });

    it("renders with HTML character count status bar", () => {
        const component = render(
            <RichText {...defaultProps} statusBarContent={"characterCountHtml" as StatusBarContentEnum} />
        );
        expect(component.container).toMatchSnapshot();
    });

    describe("does not write to the attribute on load", () => {
        // The editor's serialization of a stored value is rarely byte-identical to it, and
        // derived list marker formatting widens that gap. Writing the difference back on mount
        // would dirty the attribute and fire the On change action without any user edit.
        //
        // The write is debounced by 200ms in EditorWrapper, so the timer has to be flushed —
        // otherwise these assertions would hold no matter what the editor emitted.
        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());

        function renderAndFlush(stringAttribute: RichTextContainerProps["stringAttribute"]): void {
            render(<RichText {...defaultProps} stringAttribute={stringAttribute} />);
            act(() => {
                jest.advanceTimersByTime(500);
            });
        }

        it("leaves an unformatted value untouched", () => {
            const stringAttribute = new EditableValueBuilder<string>().withValue(richTextDefaultValue).build();

            renderAndFlush(stringAttribute);

            expect(stringAttribute.setValue).not.toHaveBeenCalled();
        });

        it("leaves a list whose first run is formatted untouched", () => {
            const stored = `<ol><li><p><span style="font-size: 32px">Hello</span></p></li></ol>`;
            const stringAttribute = new EditableValueBuilder<string>().withValue(stored).build();

            renderAndFlush(stringAttribute);

            expect(stringAttribute.setValue).not.toHaveBeenCalled();
            expect(stringAttribute.value).toBe(stored);
        });
    });

    describe("Empty content handling", () => {
        it("handles empty string value", () => {
            const emptyAttribute = new EditableValueBuilder<string>().withValue("").build();
            const component = render(<RichText {...defaultProps} stringAttribute={emptyAttribute} />);
            expect(component.container).toBeTruthy();
        });

        it("handles undefined value", () => {
            const undefinedAttribute = new EditableValueBuilder<string>().withValue(undefined).build();
            const component = render(<RichText {...defaultProps} stringAttribute={undefinedAttribute} />);
            expect(component.container).toBeTruthy();
        });

        it("handles <p></p> value", () => {
            const emptyParagraphAttribute = new EditableValueBuilder<string>().withValue("<p></p>").build();
            const component = render(<RichText {...defaultProps} stringAttribute={emptyParagraphAttribute} />);
            expect(component.container).toBeTruthy();
        });
    });

    describe("default upload without an image source", () => {
        function dropImage(container: HTMLElement): { requested: jest.Mock } {
            const editorDom = container.querySelector(".ProseMirror") as HTMLElement;
            const requested = jest.fn();
            editorDom.addEventListener(IMAGE_REQUEST_EVENT, requested);
            const file = new File(["abc"], "drop.png", { type: "image/png" });
            fireEvent.drop(editorDom, { dataTransfer: { files: [file], types: ["Files"] } });
            return { requested };
        }

        it("ignores a stale disabled value and inserts dropped images inline", async () => {
            const { container } = render(<RichText {...defaultProps} enableDefaultUpload={false} />);

            const { requested } = dropImage(container);

            expect(requested).not.toHaveBeenCalled();
            await waitFor(() => {
                expect(container.querySelector(".ProseMirror img[src^='data:image/png']")).toBeInTheDocument();
            });
        });

        it("hands dropped images to the image dialog when an image source is configured", () => {
            const { container } = render(
                <RichText {...defaultProps} enableDefaultUpload={false} imageSource={{} as ListValue} />
            );

            const { requested } = dropImage(container);

            expect(requested).toHaveBeenCalledTimes(1);
        });
    });

    describe("image dialog opened by a drop", () => {
        function renderWithUploader(handleChange: jest.Mock): HTMLElement {
            const uploader = (
                <input
                    type="file"
                    aria-label="entity-upload"
                    onChange={event => handleChange(Array.from(event.currentTarget.files ?? []).map(f => f.name))}
                />
            );
            const { container } = render(
                <RichText
                    {...defaultProps}
                    preset="full"
                    enableDefaultUpload={false}
                    imageSource={{} as ListValue}
                    imageSourceContent={uploader}
                />
            );
            return container.querySelector(".ProseMirror") as HTMLElement;
        }

        function drop(editorDom: HTMLElement, name: string): void {
            const file = new File(["abc"], name, { type: "image/png" });
            fireEvent.drop(editorDom, { dataTransfer: { files: [file], types: ["Files"] } });
        }

        it("does not re-upload the dropped file when the dialog is reopened from the toolbar", async () => {
            const handleChange = jest.fn();
            const editorDom = renderWithUploader(handleChange);

            drop(editorDom, "first.png");
            await waitFor(() => expect(handleChange).toHaveBeenCalledWith(["first.png"]));

            const imageButton = screen.getByTitle("Insert Image");
            fireEvent.click(imageButton);
            fireEvent.click(imageButton);

            expect(screen.getByRole("button", { name: "URL" })).toHaveClass("active");
            expect(handleChange).toHaveBeenCalledTimes(1);
        });

        it("hands off files from a second drop while the dialog is open", async () => {
            const handleChange = jest.fn();
            const editorDom = renderWithUploader(handleChange);

            drop(editorDom, "first.png");
            await waitFor(() => expect(handleChange).toHaveBeenCalledWith(["first.png"]));
            drop(editorDom, "second.png");

            await waitFor(() => expect(handleChange).toHaveBeenCalledWith(["second.png"]));
            expect(handleChange).toHaveBeenCalledTimes(2);
        });
    });
});
