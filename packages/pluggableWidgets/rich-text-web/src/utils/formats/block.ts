import Block from "quill/blots/block";

class MxBlock extends Block {
    html(): string {
        // quill return empty paragraph when there is no content (just empty line)
        // to preserve the line breaks, we add empty space
        if (this.domNode.childElementCount === 1 && this.domNode.children[0] instanceof HTMLBRElement) {
            return this.domNode.outerHTML.replace(/<br>/g, "&nbsp;");
        } else if (this.domNode.childElementCount === 0 && this.domNode.textContent?.trim() === "") {
            this.domNode.innerHTML = "&nbsp;";
            return this.domNode.outerHTML;
        } else {
            return this.domNode.outerHTML;
        }
    }
}
export default MxBlock;
