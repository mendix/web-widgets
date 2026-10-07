import { render } from "@testing-library/react";
import { NodeViewProps } from "@tiptap/react";
import { GenericEmbed } from "../../extensions/GenericEmbed";
import { EmbedResize } from "../EmbedResize";

/** Renders the node view in isolation with fabricated props, as YouTubeResize's test does. */
function renderNodeView(styleDataFormat: "inline" | "class"): HTMLElement {
    const props = {
        node: { attrs: { src: "https://player.vimeo.com/video/1", width: 640, height: 480 } },
        updateAttributes: jest.fn(),
        extension: GenericEmbed.configure({ styleDataFormat })
    } as unknown as NodeViewProps;

    const { container } = render(<EmbedResize {...props} />);
    return container;
}

describe("EmbedResize node view — sizing", () => {
    it("sizes the container and iframe with inline style in inline format", () => {
        const container = renderNodeView("inline");
        const box = container.querySelector(".embed-container") as HTMLElement;
        const iframe = container.querySelector("iframe") as HTMLIFrameElement;

        expect(box.style.width).toBe("640px");
        expect(box.style.height).toBe("480px");
        expect(iframe.style.width).toBe("640px");
        expect(iframe.style.height).toBe("480px");
        expect(box.hasAttribute("data-width")).toBe(false);
        expect(box.hasAttribute("data-height")).toBe(false);
    });

    it("carries the size in data attributes on the container in class format", () => {
        const container = renderNodeView("class");
        const box = container.querySelector(".embed-container") as HTMLElement;
        const iframe = container.querySelector("iframe") as HTMLIFrameElement;

        expect(box.getAttribute("data-width")).toBe("640px");
        expect(box.getAttribute("data-height")).toBe("480px");
        expect(box.hasAttribute("style")).toBe(false);
        expect(iframe.getAttribute("width")).toBe("640");
        expect(iframe.getAttribute("height")).toBe("480");
        expect(iframe.hasAttribute("style")).toBe(false);
    });
});
