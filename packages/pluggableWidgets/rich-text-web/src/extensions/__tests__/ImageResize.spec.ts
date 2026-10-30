import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { ImageResize } from "../ImageResize";

function editorWith(html: string): Editor {
    return new Editor({
        element: document.createElement("div"),
        content: html,
        extensions: [StarterKit, ImageResize]
    });
}

function imageAttrs(editor: Editor): Record<string, unknown> {
    let attrs: Record<string, unknown> = {};
    editor.state.doc.descendants(node => {
        if (node.type.name === "image") {
            attrs = node.attrs;
        }
        return true;
    });
    return attrs;
}

describe("ImageResize parsing", () => {
    it("keeps the unitless dimensions written by Rich Text 4", () => {
        const editor = editorWith('<p><img src="a.png" width="300" height="200"></p>');

        expect(imageAttrs(editor)).toMatchObject({ width: "300", height: "200" });
    });

    it("keeps the pixel strings written by Rich Text 5", () => {
        const editor = editorWith('<p><img src="a.png" width="300px" height="200px"></p>');

        expect(imageAttrs(editor)).toMatchObject({ width: "300px", height: "200px" });
    });

    it("reads dimensions from inline style when no attribute is present", () => {
        const editor = editorWith('<p><img src="a.png" style="width:300px;height:200px"></p>');

        expect(imageAttrs(editor)).toMatchObject({ width: "300px", height: "200px" });
    });
});

describe("ImageResize serialization", () => {
    it("leaves Rich Text 4 content unchanged when nothing is edited", () => {
        const editor = editorWith('<p><img src="a.png" width="300" height="200"></p>');

        expect(editor.getHTML()).toContain('width="300" height="200"');
    });

    it("drops the px suffix so the attribute value is a valid HTML dimension", () => {
        const editor = editorWith('<p><img src="a.png" width="300px" height="200px"></p>');

        expect(editor.getHTML()).toContain('width="300" height="200"');
    });

    it("serializes inline-style dimensions as attributes, not as style", () => {
        const editor = editorWith('<p><img src="a.png" style="width:300px;height:200px"></p>');
        const html = editor.getHTML();

        expect(html).toContain('width="300" height="200"');
        expect(html).not.toContain("style=");
    });

    it("keeps a percentage width", () => {
        const editor = editorWith('<p><img src="a.png" style="width:50%"></p>');

        expect(editor.getHTML()).toContain('width="50%"');
    });

    it("omits a dimension a width attribute cannot express", () => {
        const editor = editorWith('<p><img src="a.png" style="width:20em"></p>');

        // `width="20em"` would be legacy-parsed as 20 pixels, silently shrinking the image.
        expect(editor.getHTML()).not.toContain("width=");
    });

    it("writes no dimensions for an image without a size", () => {
        const editor = editorWith('<p><img src="a.png"></p>');
        const html = editor.getHTML();

        expect(html).not.toContain("width=");
        expect(html).not.toContain("height=");
    });
});
