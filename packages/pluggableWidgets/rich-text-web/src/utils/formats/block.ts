import Block from "quill/blots/block";

class MxBlock extends Block {
    html(): string {
        // quill return empty paragraph when there is no content (just empty line)
        // to preserve the line breaks, we add empty space
        const htmlContent = this.domNode.outerHTML;
        if (this.domNode.childElementCount === 1 && this.domNode.children[0] instanceof HTMLBRElement) {
            return htmlContent.replace(/<br>/g, "&nbsp;");
        }
        return this.domNode.outerHTML;
    }
}
export default MxBlock;
