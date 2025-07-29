import ListItem from "quill/formats/list";
import "./customList.scss";
/**
 * adding custom list item, alowing extra list style
 */

export const STANDARD_LIST_TYPES = ["ordered", "checked", "unchecked", "bullet"];

export default class CustomListItem extends ListItem {
    format(name: string, value: string): void {
        if (name === this.statics.blotName && value) {
            if (!STANDARD_LIST_TYPES.find(x => x === value)) {
                this.domNode.setAttribute("data-custom-list", value);
                this.domNode.setAttribute("data-list", "ordered");
            } else {
                this.domNode.setAttribute("data-list", value);
                this.domNode.removeAttribute("data-custom-list");
            }
        } else {
            super.format(name, value);
        }
    }

    static create(value: any): any {
        const node = super.create(value) as HTMLElement;
        if (!STANDARD_LIST_TYPES.find(x => x === value)) {
            node.setAttribute("data-custom-list", value);
            node.setAttribute("data-list", "ordered");
        } else {
            node.setAttribute("data-list", value);
            node.removeAttribute("data-custom-list");
        }
        node.setAttribute("title", this.blotName);
        return node;
    }

    static formats(domNode: HTMLElement): string | undefined {
        return domNode.dataset.customList || domNode.dataset.list || undefined;
    }
}
