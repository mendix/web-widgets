import Quill, { Delta } from "quill";
import Clipboard from "quill/modules/clipboard";

export default class CustomClipboard extends Clipboard {
    constructor(quill: Quill, options: any) {
        super(quill, options);

        // remove default list matchers for ol and ul
        this.matchers = this.matchers.filter(matcher => matcher[0] !== "ol, ul");

        // add custom list matchers for ol and ul to allow custom list types (lower-alpha, lower-roman, etc.)
        this.addMatcher("ol, ul", (node, delta) => {
            const format = "list";
            let list = "ordered";
            const element = node as HTMLUListElement;
            const checkedAttr = element.getAttribute("data-checked");
            if (checkedAttr) {
                list = checkedAttr === "true" ? "checked" : "unchecked";
            } else {
                const listStyleType = element.style.listStyleType;
                if (listStyleType) {
                    if (listStyleType === "disc") {
                        // disc is standard list type, convert to bullet
                        list = "bullet";
                    } else if (listStyleType === "decimal") {
                        // list decimal type is dependant on indent level, convert to standard ordered list
                        list = "ordered";
                    } else {
                        list = listStyleType;
                    }
                } else {
                    list = element.tagName === "OL" ? "ordered" : "bullet";
                }
            }

            // apply list format to delta
            return delta.reduce((newDelta, op) => {
                if (!op.insert) return newDelta;
                if (op.attributes && op.attributes[format]) {
                    return newDelta.push(op);
                }
                const formats = list ? { [format]: list } : {};

                return newDelta.insert(op.insert, { ...formats, ...op.attributes });
            }, new Delta());
        });
    }
}
