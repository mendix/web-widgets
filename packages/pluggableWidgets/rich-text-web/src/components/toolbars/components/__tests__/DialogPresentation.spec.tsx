import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";
import { DialogStyleEnum } from "../../../../../typings/RichTextProps";
import { EditorContext } from "../../../EditorContext";
import { ColorPicker } from "../ColorPicker";
import { ConfirmDialog } from "../ConfirmDialog";
import { HelpDialog } from "../HelpDialog";
import { ImageDialog } from "../ImageDialog";
import { LinkDialog } from "../LinkDialog";
import { TableGridSelector } from "../TableGridSelector";
import { VideoDialog } from "../VideoDialog";

const OVERLAY_SELECTOR = ".widget-rich-text-dialog-overlay";

function chainSpy(): { chain: any; calls: string[] } {
    const calls: string[] = [];
    const chain: any = new Proxy(
        {},
        {
            get: (_target, prop: string) => () => {
                calls.push(prop);
                return prop === "run" ? true : chain;
            }
        }
    );
    return { chain, calls };
}

function withEditor(children: ReactNode, dialogStyle: DialogStyleEnum, editor: any = null): ReactElement {
    return (
        <EditorContext.Provider
            value={{
                editor,
                codeViewState: { isCodeView: false, htmlCode: "", showConfirm: false },
                codeViewDispatch: () => undefined,
                dialogStyle,
                imageConfig: { enableDefaultUpload: false, hasImageSource: false }
            }}
        >
            {children as ReactElement}
        </EditorContext.Provider>
    );
}

const noop = (): void => undefined;

const INSERT_DIALOGS: Array<[string, ReactElement]> = [
    ["ImageDialog", <ImageDialog key="image" onClose={noop} referenceElement={null} />],
    ["VideoDialog", <VideoDialog key="video" onClose={noop} referenceElement={null} />],
    ["LinkDialog", <LinkDialog key="link" onClose={noop} referenceElement={null} />]
];

describe.each(INSERT_DIALOGS)("%s presentation", (_name, dialog) => {
    it("renders no overlay when the dialog style is inline", () => {
        render(withEditor(dialog, "inline"));

        expect(document.querySelector(OVERLAY_SELECTOR)).toBeNull();
        expect(document.querySelector(".toolbar-dialog")).not.toBeNull();
    });

    it("renders a modal dialog over an overlay when the dialog style is focused", () => {
        render(withEditor(dialog, "focused"));

        expect(document.querySelector(OVERLAY_SELECTOR)).not.toBeNull();
        expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });
});

describe("dialogs that are always focused", () => {
    it("HelpDialog renders an overlay even with the inline dialog style in context", () => {
        render(withEditor(<HelpDialog onClose={noop} />, "inline"));

        expect(document.querySelector(OVERLAY_SELECTOR)).not.toBeNull();
        expect(screen.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeInTheDocument();
    });

    it("ConfirmDialog renders an overlay even with the inline dialog style in context", () => {
        render(
            withEditor(<ConfirmDialog message="Discard your changes?" onConfirm={noop} onCancel={noop} />, "inline")
        );

        expect(document.querySelector(OVERLAY_SELECTOR)).not.toBeNull();
        expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });
});

// The toolbar popovers keep their pre-existing anchored behaviour: the new property is about
// dialogs only.
describe("popovers are unaffected by the dialog style", () => {
    it("ColorPicker renders anchored with no overlay while the style is focused", () => {
        render(withEditor(<ColorPicker onColorChange={noop} onClose={noop} referenceElement={null} />, "focused"));

        expect(document.querySelector(OVERLAY_SELECTOR)).toBeNull();
        expect(document.querySelector(".color-picker-dropdown")).not.toBeNull();
    });

    it("TableGridSelector renders anchored with no overlay while the style is focused", () => {
        const { chain } = chainSpy();
        const editor = { chain: () => chain } as any;

        render(withEditor(<TableGridSelector editor={editor} onClose={noop} referenceElement={null} />, "focused"));

        expect(document.querySelector(OVERLAY_SELECTOR)).toBeNull();
        expect(document.querySelector(".table-grid-selector")).not.toBeNull();
    });
});

// `chain().focus()` is what restores the selection the editor held when the dialog opened, so it
// has to run before the insert command in both presentations.
describe.each(["inline", "focused"] as const)("selection preservation (%s)", dialogStyle => {
    it("focuses the editor before inserting an image", () => {
        const { chain, calls } = chainSpy();
        const editor = { chain: () => chain } as any;

        render(withEditor(<ImageDialog onClose={noop} referenceElement={null} />, dialogStyle, editor));

        fireEvent.change(screen.getByLabelText("Image URL"), {
            target: { value: "https://example.com/image.jpg" }
        });
        fireEvent.click(screen.getByRole("button", { name: "Insert" }));

        expect(calls).toEqual(["focus", "setImage", "run"]);
    });
});
