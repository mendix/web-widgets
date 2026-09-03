import { render } from "@testing-library/react";
import { NodeViewProps } from "@tiptap/react";
import { ImageResize } from "../ImageResize";

/** Renders the node view in isolation with fabricated props, as YouTubeResize's test does. */
function renderNodeView(attrs: Record<string, unknown> = {}): HTMLElement {
    const props = {
        node: { attrs: { src: "a.png", alt: null, width: null, height: null, ...attrs } },
        updateAttributes: jest.fn()
    } as unknown as NodeViewProps;

    const { container } = render(<ImageResize {...props} />);
    return container;
}

function imageStyle(container: HTMLElement): CSSStyleDeclaration {
    return (container.querySelector("img") as HTMLImageElement).style;
}

describe("ImageResize node view sizing", () => {
    it("renders the unitless dimensions of Rich Text 4 content as pixels", () => {
        const style = imageStyle(renderNodeView({ width: "300", height: "200" }));

        expect(style.width).toBe("300px");
        expect(style.height).toBe("200px");
    });

    it("renders the pixel strings of Rich Text 5 content unchanged", () => {
        const style = imageStyle(renderNodeView({ width: "300px", height: "200px" }));

        expect(style.width).toBe("300px");
        expect(style.height).toBe("200px");
    });

    it("keeps a percentage width", () => {
        expect(imageStyle(renderNodeView({ width: "50%" })).width).toBe("50%");
    });

    it("falls back to auto when no size is stored", () => {
        const style = imageStyle(renderNodeView());

        expect(style.width).toBe("auto");
        expect(style.height).toBe("auto");
    });

    it("sizes the container along with the image", () => {
        const container = renderNodeView({ width: "300", height: "200" });
        const box = container.querySelector(".image-container") as HTMLElement;

        expect(box.style.width).toBe("300px");
        expect(box.style.height).toBe("200px");
    });
});
