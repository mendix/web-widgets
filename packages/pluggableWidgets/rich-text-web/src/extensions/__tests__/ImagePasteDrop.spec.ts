import { Editor } from "@tiptap/core";
import { Image } from "@tiptap/extension-image";
import { StarterKit } from "@tiptap/starter-kit";
import { ImageFileError } from "../../utils/imageFiles";
import { IMAGE_DROP_ERROR_EVENT, ImagePasteDrop, insertImageFiles } from "../ImagePasteDrop";

const DRAG_OVER_CLASS = "rich-text-drag-over";

type DOMHandlers = Record<string, (view: Editor["view"], event: any) => boolean>;

interface Harness {
    editor: Editor;
    wrapper: HTMLElement;
    handlers: DOMHandlers;
    errors: ImageFileError[];
}

function imageFile(name: string, content: string, type = "image/png", size?: number): File {
    const file = new File([content], name, { type });
    if (size !== undefined) {
        Object.defineProperty(file, "size", { value: size });
    }
    return file;
}

function dropEvent(files: File[], coords: { clientX: number; clientY: number } = { clientX: 0, clientY: 0 }): any {
    return {
        ...coords,
        preventDefault: jest.fn(),
        dataTransfer: { files, types: files.length > 0 ? ["Files"] : [] }
    };
}

function pasteEvent(files: File[], types = files.length > 0 ? ["Files"] : []): any {
    return {
        preventDefault: jest.fn(),
        clipboardData: { files, types }
    };
}

function dragEvent(types: string[] = ["Files"]): any {
    return { preventDefault: jest.fn(), dataTransfer: { types } };
}

function makeHarness({ enabled = true, editable = true } = {}): Harness {
    const wrapper = document.createElement("div");
    wrapper.className = "tiptap-wrapper";
    const element = document.createElement("div");
    wrapper.appendChild(element);
    document.body.appendChild(wrapper);

    const editor = new Editor({
        element,
        content: "<p>Hello world</p>",
        extensions: [
            StarterKit,
            Image.configure({ inline: true, allowBase64: true }),
            ImagePasteDrop.configure({
                isEnabled: () => enabled,
                isEditable: () => editable,
                wrapperSelector: ".tiptap-wrapper",
                dragOverClass: DRAG_OVER_CLASS
            })
        ]
    });

    // Tiptap core registers its own drop/paste DOM handlers, so match this plugin by key.
    const plugin = editor.state.plugins.find(p => (p as unknown as { key: string }).key.startsWith("imagePasteDrop"));
    const errors: ImageFileError[] = [];
    editor.view.dom.addEventListener(IMAGE_DROP_ERROR_EVENT, event => {
        errors.push((event as CustomEvent<ImageFileError>).detail);
    });

    return { editor, wrapper, handlers: plugin!.spec.props!.handleDOMEvents as DOMHandlers, errors };
}

/** Lets the FileReader callbacks and the sequential inserts run. */
async function flush(): Promise<void> {
    for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}

function imagePositions(editor: Editor): Array<{ pos: number; src: string }> {
    const found: Array<{ pos: number; src: string }> = [];
    editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "image") {
            found.push({ pos, src: node.attrs.src });
        }
        return true;
    });
    return found;
}

describe("ImagePasteDrop drop handling", () => {
    it("inserts a dropped image at the drop position", async () => {
        const { editor, handlers } = makeHarness();
        jest.spyOn(editor.view, "posAtCoords").mockReturnValue({ pos: 6, inside: 0 });
        const event = dropEvent([imageFile("a.png", "a")], { clientX: 40, clientY: 12 });

        expect(handlers.drop(editor.view, event)).toBe(true);
        expect(event.preventDefault).toHaveBeenCalled();
        await flush();

        const images = imagePositions(editor);
        expect(images).toHaveLength(1);
        expect(images[0].pos).toBe(6);
        expect(images[0].src.startsWith("data:image/png;base64,")).toBe(true);
    });

    it("inserts several dropped images in drop order", async () => {
        const { editor, handlers } = makeHarness();
        jest.spyOn(editor.view, "posAtCoords").mockReturnValue({ pos: 6, inside: 0 });
        const files = [imageFile("a.png", "a"), imageFile("b.png", "bb"), imageFile("c.png", "ccc")];

        handlers.drop(editor.view, dropEvent(files));
        await flush();

        const srcs = imagePositions(editor).map(image => image.src);
        expect(srcs).toHaveLength(3);
        expect(srcs).toEqual([...srcs].sort((a, b) => a.length - b.length));
        expect(new Set(srcs).size).toBe(3);
    });

    it("rejects a file above the size limit and reports its size", async () => {
        const { editor, handlers, errors } = makeHarness();
        const event = dropEvent([imageFile("huge.png", "a", "image/png", 13_000_000)]);

        expect(handlers.drop(editor.view, event)).toBe(true);
        expect(event.preventDefault).toHaveBeenCalled();
        await flush();

        expect(imagePositions(editor)).toHaveLength(0);
        expect(errors).toEqual([{ key: "image.errorTooLarge", arg: "12.4 MB" }]);
    });

    it("inserts the valid files of a mixed drop and reports the rejected one", async () => {
        const { editor, handlers, errors } = makeHarness();
        jest.spyOn(editor.view, "posAtCoords").mockReturnValue({ pos: 6, inside: 0 });

        handlers.drop(editor.view, dropEvent([imageFile("ok.png", "a"), imageFile("huge.png", "a", "image/png", 9e6)]));
        await flush();

        expect(imagePositions(editor)).toHaveLength(1);
        expect(errors).toEqual([{ key: "image.errorTooLarge", arg: "8.6 MB" }]);
    });

    it("leaves a drop without image files to ProseMirror", () => {
        const { editor, handlers } = makeHarness();
        const event = dropEvent([imageFile("doc.pdf", "a", "application/pdf")]);

        expect(handlers.drop(editor.view, event)).toBe(false);
        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("swallows the drop when default upload is disabled", async () => {
        const { editor, handlers, errors } = makeHarness({ enabled: false });
        const event = dropEvent([imageFile("a.png", "a")]);

        expect(handlers.drop(editor.view, event)).toBe(true);
        expect(event.preventDefault).toHaveBeenCalled();
        await flush();

        expect(imagePositions(editor)).toHaveLength(0);
        expect(errors).toEqual([]);
    });

    it("swallows the drop when the editor is read-only", async () => {
        const { editor, handlers, errors } = makeHarness({ editable: false });
        const event = dropEvent([imageFile("a.png", "a")]);

        expect(handlers.drop(editor.view, event)).toBe(true);
        expect(event.preventDefault).toHaveBeenCalled();
        await flush();

        expect(imagePositions(editor)).toHaveLength(0);
        expect(errors).toEqual([]);
    });
});

describe("ImagePasteDrop paste handling", () => {
    it("inserts a pasted image at the selection", async () => {
        const { editor, handlers } = makeHarness();
        editor.commands.setTextSelection(4);
        const event = pasteEvent([imageFile("a.png", "a")]);

        expect(handlers.paste(editor.view, event)).toBe(true);
        expect(event.preventDefault).toHaveBeenCalled();
        await flush();

        expect(imagePositions(editor)[0].pos).toBe(4);
    });

    it("leaves a paste that also carries HTML to the existing paste handling", () => {
        const { editor, handlers } = makeHarness();
        const event = pasteEvent([imageFile("a.png", "a")], ["text/html", "Files"]);

        expect(handlers.paste(editor.view, event)).toBe(false);
        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("swallows the paste when default upload is disabled", async () => {
        const { editor, handlers } = makeHarness({ enabled: false });
        const event = pasteEvent([imageFile("a.png", "a")]);

        expect(handlers.paste(editor.view, event)).toBe(true);
        await flush();

        expect(imagePositions(editor)).toHaveLength(0);
    });
});

describe("ImagePasteDrop drag affordance", () => {
    it("prevents dragover of a file drag so the drop reaches the editor", () => {
        const { editor, handlers } = makeHarness();
        const event = dragEvent();

        expect(handlers.dragover(editor.view, event)).toBe(true);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it("prevents dragover even when insertion is not allowed", () => {
        const { editor, handlers } = makeHarness({ enabled: false });
        const event = dragEvent();

        handlers.dragover(editor.view, event);

        expect(event.preventDefault).toHaveBeenCalled();
    });

    it("ignores drags that carry no file", () => {
        const { editor, handlers } = makeHarness();
        const event = dragEvent(["text/html"]);

        expect(handlers.dragover(editor.view, event)).toBe(false);
        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("highlights the wrapper while a file drag is over the editor", () => {
        const { editor, handlers, wrapper } = makeHarness();

        handlers.dragenter(editor.view, dragEvent());

        expect(wrapper.classList.contains(DRAG_OVER_CLASS)).toBe(true);

        handlers.dragleave(editor.view, dragEvent());

        expect(wrapper.classList.contains(DRAG_OVER_CLASS)).toBe(false);
    });

    it("keeps the highlight while nested elements are entered", () => {
        const { editor, handlers, wrapper } = makeHarness();

        handlers.dragenter(editor.view, dragEvent());
        handlers.dragenter(editor.view, dragEvent());
        handlers.dragleave(editor.view, dragEvent());

        expect(wrapper.classList.contains(DRAG_OVER_CLASS)).toBe(true);
    });

    it("clears the highlight on drop even after several dragenters", () => {
        const { editor, handlers, wrapper } = makeHarness();

        handlers.dragenter(editor.view, dragEvent());
        handlers.dragenter(editor.view, dragEvent());
        handlers.drop(editor.view, dropEvent([imageFile("a.png", "a")]));

        expect(wrapper.classList.contains(DRAG_OVER_CLASS)).toBe(false);
    });

    it("does not highlight when default upload is disabled", () => {
        const { editor, handlers, wrapper } = makeHarness({ enabled: false });

        handlers.dragenter(editor.view, dragEvent());

        expect(wrapper.classList.contains(DRAG_OVER_CLASS)).toBe(false);
    });
});

describe("insertImageFiles", () => {
    it("clamps the insert position to the current document size", async () => {
        const insertImage = jest.fn();

        await insertImageFiles([imageFile("a.png", "a")], 500, {
            insertImage,
            docSize: () => 12,
            reportError: jest.fn()
        });

        expect(insertImage).toHaveBeenCalledWith(expect.stringContaining("data:image/png;base64,"), 12);
    });

    it("reports a read failure and continues with the next file", async () => {
        const readAsDataURL = jest.spyOn(FileReader.prototype, "readAsDataURL").mockImplementationOnce(function (
            this: FileReader
        ) {
            this.onerror?.(new ProgressEvent("error") as ProgressEvent<FileReader>);
        });
        const insertImage = jest.fn();
        const reportError = jest.fn();

        await insertImageFiles([imageFile("bad.png", "a"), imageFile("good.png", "b")], 3, {
            insertImage,
            docSize: () => 100,
            reportError
        });

        expect(reportError).toHaveBeenCalledWith({ key: "image.errorReadFailed" });
        expect(insertImage).toHaveBeenCalledTimes(1);
        expect(insertImage).toHaveBeenCalledWith(expect.any(String), 3);

        readAsDataURL.mockRestore();
    });
});
