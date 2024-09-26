import katex from "katex";
import Embed from "quill/blots/embed";

class Formula extends Embed {
    static blotName = "formula";
    static className = "ql-formula";
    static tagName = "SPAN";

    html(): string {
        const { formula } = this.value();
        return `<span>${formula}</span>`;
    }

    static create(value: string): HTMLElement {
        const node = super.create(value) as HTMLElement;
        if (typeof value === "string") {
            katex.render(value, node, {
                throwOnError: false,
                errorColor: "#f00"
            });
            node.setAttribute("data-value", value);
        }
        return node;
    }

    static value(domNode: Element): any {
        return domNode.getAttribute("data-value");
    }
}

export default Formula;
