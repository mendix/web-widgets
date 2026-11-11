import { Editor, JSONContent } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { GenericEmbed } from "../GenericEmbed";

function makeEditor(): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({ element, extensions: [StarterKit, GenericEmbed] });
}

function embedNodes(editor: Editor): JSONContent[] {
    return (editor.getJSON().content ?? []).filter(node => node.type === "genericEmbed");
}

const wrap = (src: string): string => `<div data-generic-embed=""><iframe src="${src}"></iframe></div>`;

let editor: Editor;
afterEach(() => editor?.destroy());

// GenericEmbed only parses its own wrapper (div[data-generic-embed]); bare iframes are not
// turned into embed nodes. Inside the wrapper, the iframe src is vetted by parseEmbedCode:
// a disallowed src is dropped on parse, and renderHTML refuses to emit an iframe for it.
describe("GenericEmbed — parse vetting", () => {
    it.each([
        { name: "disallowed iframe", html: '<iframe src="https://evil.com/x"></iframe>' },
        { name: "allowlisted iframe without wrapper", html: '<iframe src="https://www.youtube.com/embed/x"></iframe>' }
    ])("bare $name yields no embed node", ({ html }) => {
        editor = makeEditor();
        editor.commands.setContent(html);

        expect(embedNodes(editor)).toHaveLength(0);
        expect(editor.getHTML()).not.toContain("<iframe");
    });

    it("wrapped allowlisted iframe yields one embed node with its src and default size", () => {
        editor = makeEditor();
        editor.commands.setContent(wrap("https://www.youtube.com/embed/x"));

        const nodes = embedNodes(editor);
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attrs).toMatchObject({ src: "https://www.youtube.com/embed/x", width: 640, height: 480 });
    });

    it("renders the allowlisted iframe with sandbox and without allow-same-origin", () => {
        editor = makeEditor();
        editor.commands.setContent(wrap("https://www.youtube.com/embed/x"));

        const html = editor.getHTML();
        expect(html).toContain('src="https://www.youtube.com/embed/x"');
        expect(html).toMatch(/sandbox="[^"]*allow-scripts/);
        expect(html).not.toContain("allow-same-origin");
        expect(html).toContain('referrerpolicy="strict-origin-when-cross-origin"');
    });

    it.each([
        "https://evil.com/x",
        "https://youtube.com.evil.io/embed/x",
        "javascript:alert(1)",
        "DATA:text/html,x",
        "ftp://youtube.com/x"
    ])("wrapped iframe with src %p keeps no src and renders no iframe", src => {
        editor = makeEditor();
        editor.commands.setContent(wrap(src));

        const nodes = embedNodes(editor);
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attrs?.src).toBeNull();
        expect(editor.getHTML()).not.toContain("<iframe");
    });
});

// The setGenericEmbed command bypasses parseHTML, so renderHTML is the last line of defense.
describe("GenericEmbed — render vetting", () => {
    it("does not render an iframe for a disallowed src inserted via command", () => {
        editor = makeEditor();
        editor.commands.setGenericEmbed({ src: "https://evil.com/x" });

        expect(embedNodes(editor)).toHaveLength(1);
        expect(editor.getHTML()).not.toContain("<iframe");
    });

    it("renders an iframe for an allowlisted src inserted via command", () => {
        editor = makeEditor();
        editor.commands.setGenericEmbed({ src: "https://player.vimeo.com/video/1", width: 400, height: 300 });

        const html = editor.getHTML();
        expect(html).toContain('src="https://player.vimeo.com/video/1"');
        expect(html).toContain('width="400"');
        expect(html).toContain('height="300"');
    });
});
