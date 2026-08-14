import { render } from "@testing-library/react";
import { Editor } from "@tiptap/core";
import { YoutubeOptions } from "@tiptap/extension-youtube";
import { NodeViewProps } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { YouTubeResize as YouTubeResizeExtension } from "../../extensions/YouTubeResize";
import { YouTubeResize } from "../YouTubeResize";

const VIDEO_ID = "3k66DQuU31A";
const WATCH_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

/**
 * Renders the node view in isolation with fabricated props. Options come from the real
 * extension so the test cannot drift from the shipped defaults.
 */
function renderNodeView(
    attrs: Record<string, unknown> = {},
    optionOverrides: Partial<YoutubeOptions> = {}
): HTMLElement {
    const props = {
        node: { attrs: { src: WATCH_URL, start: 0, width: 560, height: 314, ...attrs } },
        updateAttributes: jest.fn(),
        extension: YouTubeResizeExtension.configure(optionOverrides)
    } as unknown as NodeViewProps;

    const { container } = render(<YouTubeResize {...props} />);
    return container;
}

function makeEditor(optionOverrides: Partial<YoutubeOptions> = {}): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({
        element,
        extensions: [StarterKit, YouTubeResizeExtension.configure(optionOverrides)]
    });
}

/** Extracts the iframe `src` from serialized editor HTML, undoing attribute escaping. */
function serializedSrc(html: string): string {
    const raw = html.match(/<iframe[^>]*\ssrc="([^"]*)"/)?.[1] ?? "";
    return raw.replace(/&amp;/g, "&");
}

function nodeViewSrc(container: HTMLElement): string {
    return container.querySelector("iframe")?.getAttribute("src") ?? "";
}

describe("YouTubeResize node view — embed URL", () => {
    it("converts a watch URL to an embed URL", () => {
        expect(nodeViewSrc(renderNodeView())).toMatch(
            new RegExp(`^https://www\\.youtube\\.com/embed/${VIDEO_ID}(\\?|$)`)
        );
    });

    it("converts a youtu.be short link to an embed URL", () => {
        const src = nodeViewSrc(renderNodeView({ src: `https://youtu.be/${VIDEO_ID}` }));

        expect(src).toMatch(new RegExp(`^https://www\\.youtube\\.com/embed/${VIDEO_ID}(\\?|$)`));
    });

    it("passes an embed URL through without duplicating /embed/", () => {
        const embedUrl = `https://www.youtube.com/embed/${VIDEO_ID}`;
        const src = nodeViewSrc(renderNodeView({ src: embedUrl }));

        expect(src).toBe(embedUrl);
        expect(src.match(/\/embed\//g)).toHaveLength(1);
    });

    it("never renders the raw watch URL", () => {
        expect(nodeViewSrc(renderNodeView())).not.toContain("/watch?v=");
    });
});

describe("YouTubeResize node view — parity with serialized output", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("honours the nocookie option and matches getHTML", () => {
        editor = makeEditor({ nocookie: true });
        editor.commands.setYoutubeVideo({ src: WATCH_URL });

        const viewSrc = nodeViewSrc(renderNodeView({}, { nocookie: true }));

        expect(viewSrc).toContain("https://www.youtube-nocookie.com/embed/");
        expect(viewSrc).toBe(serializedSrc(editor.getHTML()));
    });

    it("carries a non-zero start time and matches getHTML", () => {
        editor = makeEditor();
        editor.commands.insertContent({ type: "youtube", attrs: { src: WATCH_URL, start: 30 } });

        const viewSrc = nodeViewSrc(renderNodeView({ start: 30 }));

        expect(viewSrc).toContain("start=30");
        expect(viewSrc).toBe(serializedSrc(editor.getHTML()));
    });
});

describe("YouTubeResize node view — iframe attributes", () => {
    it("exposes an accessible frame title", () => {
        const iframe = renderNodeView().querySelector("iframe");

        expect(iframe?.getAttribute("title")).toBeTruthy();
    });

    it("grants the permissions the player needs", () => {
        const allow = renderNodeView().querySelector("iframe")?.getAttribute("allow") ?? "";

        expect(allow).toContain("autoplay");
        expect(allow).toContain("encrypted-media");
        expect(allow).toContain("picture-in-picture");
        expect(renderNodeView().querySelector("iframe")?.hasAttribute("allowfullscreen")).toBe(true);
    });
});

describe("YouTubeResize node view — unplayable source", () => {
    const BAD_SRC = "not-a-youtube-url";

    it("renders no iframe", () => {
        expect(renderNodeView({ src: BAD_SRC }).querySelector("iframe")).toBeNull();
    });

    it("renders visible warning text", () => {
        const placeholder = renderNodeView({ src: BAD_SRC }).querySelector(".youtube-unplayable");

        expect(placeholder).not.toBeNull();
        expect(placeholder?.textContent?.trim().length).toBeGreaterThan(0);
    });

    it("shows the stored source as plain text, never as a link", () => {
        const container = renderNodeView({ src: BAD_SRC });

        expect(container.textContent).toContain(BAD_SRC);
        expect(container.querySelector("a")).toBeNull();
    });

    it("truncates a pathologically long source", () => {
        const longSrc = "x".repeat(5000);
        const text = renderNodeView({ src: longSrc }).textContent ?? "";

        expect(text.length).toBeLessThan(longSrc.length);
        expect(text).toContain("…");
    });

    it("occupies the node's stored size so layout does not shift", () => {
        const placeholder = renderNodeView({ src: BAD_SRC, width: 560, height: 314 }).querySelector(
            ".youtube-unplayable"
        ) as HTMLElement;

        expect(placeholder.style.width).toBe("560px");
        expect(placeholder.style.height).toBe("314px");
    });

    it("is not resizable", () => {
        const container = renderNodeView({ src: BAD_SRC });

        expect(container.querySelector(".resize-handles")).toBeNull();
        expect(container.querySelectorAll(".resize-handle")).toHaveLength(0);
    });
});

describe("YouTubeResize node view — resize", () => {
    it("keeps resize handles for a playable video", () => {
        const container = renderNodeView();

        expect(container.querySelectorAll(".resize-handle")).toHaveLength(4);
    });
});

describe("YouTubeResize extension — serialization and parsing", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("keeps the canonical watch URL in node attributes", () => {
        editor = makeEditor();
        editor.commands.setYoutubeVideo({ src: WATCH_URL });

        let storedSrc: string | undefined;
        editor.state.doc.descendants(node => {
            if (node.type.name === "youtube") {
                storedSrc = node.attrs.src;
                return false;
            }
            return true;
        });

        expect(storedSrc).toBe(WATCH_URL);
    });

    it("still serializes an embed URL inside a data-youtube-video wrapper", () => {
        editor = makeEditor();
        editor.commands.setYoutubeVideo({ src: WATCH_URL });

        const html = editor.getHTML();

        expect(html).toContain("data-youtube-video");
        expect(serializedSrc(html)).toContain(`/embed/${VIDEO_ID}`);
    });

    it("parses stored embed HTML back into a playable node", () => {
        editor = makeEditor();
        editor.commands.setContent(
            `<div data-youtube-video><iframe src="https://www.youtube.com/embed/${VIDEO_ID}" width="560" height="314"></iframe></div>`
        );

        let attrs: Record<string, any> | undefined;
        editor.state.doc.descendants(node => {
            if (node.type.name === "youtube") {
                attrs = node.attrs;
                return false;
            }
            return true;
        });

        expect(attrs).toBeDefined();
        expect(nodeViewSrc(renderNodeView({ src: attrs!.src }))).toContain(`/embed/${VIDEO_ID}`);
    });
});
