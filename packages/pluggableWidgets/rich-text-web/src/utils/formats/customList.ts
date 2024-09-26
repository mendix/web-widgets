import ListItem from "quill/formats/list";
import "./customList.scss";
/**
 * adding custom list item, alowing extra list style
 */
export default class CustomListItem extends ListItem {
    static create(value: any): any {
        const node = super.create(value) as HTMLElement;
        if (!["ordered", "checked", "unchecked", "bullet"].find(x => x === value)) {
            node.setAttribute("data-custom-list", value);
            node.setAttribute("data-list", "ordered");
        } else {
            node.setAttribute("data-list", value);
        }
        node.setAttribute("title", this.blotName);
        return node;
    }
}
