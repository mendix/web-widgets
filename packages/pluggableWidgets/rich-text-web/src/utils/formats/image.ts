import Image from "quill/formats/image";
import { fetchDocumentUrl } from "../mx-data";

const ATTRIBUTES = ["alt", "height", "width", "data-src"];

class CustomImage extends Image {
    format(name: string, value: string): void {
        if (ATTRIBUTES.indexOf(name) > -1) {
            if (name === "src" && this.domNode.hasAttribute("data-src")) {
                return; // Do not set src directly, use data-src instead
            }
            if (value) {
                this.domNode.setAttribute(name, value);
            } else {
                this.domNode.removeAttribute(name);
            }
        } else {
            super.format(name, value);
        }

        if (name === "data-src" && !this.domNode.dataset.entity) {
            this.domNode.setAttribute("src", fetchDocumentUrl(value, Date.now()));
            // Mark the image as an entity to prevent further src changes
            this.domNode.setAttribute("data-entity", "true");
        }
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

export default CustomImage;
