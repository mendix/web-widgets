import Inline from "quill/blots/inline";
const ATTRIBUTES = ["alt", "height", "width", "class", "id"];

type buttonAttributes = {
    id?: string;
    class?: string;
    alt?: string;
    height?: string;
    width?: string;
};
class Button extends Inline {
    static blotName = "button";
    static tagName = "BUTTON";

    format(name: string, value: unknown): void {
        if (name !== this.statics.blotName || !value) {
            super.format(name, value);
        } else {
            // @ts-expect-error the constructor is generic function, ts will consider sanitize not exist
            this.domNode.textContent = value;
        }
    }

    static create(value: unknown): HTMLElement {
        const domNode = super.create(value) as HTMLElement;
        domNode.setAttribute("type", "button");
        if (value as buttonAttributes) {
            const buttonAttr = value as buttonAttributes;
            if (buttonAttr.id) {
                domNode.setAttribute("id", buttonAttr.id);
            }
            if (buttonAttr.class) {
                domNode.setAttribute("class", buttonAttr.class);
            }
            if (buttonAttr.width) {
                domNode.setAttribute("width", buttonAttr.width);
            }
            if (buttonAttr.height) {
                domNode.setAttribute("height", buttonAttr.height);
            }
        }
        return domNode;
    }

    static formats(domNode: Element): any {
        return ATTRIBUTES.reduce((formats: Record<string, string | null>, attribute) => {
            if (domNode.hasAttribute(attribute)) {
                formats[attribute] = domNode.getAttribute(attribute);
            }
            return formats;
        }, {});
    }
}

export default Button;
