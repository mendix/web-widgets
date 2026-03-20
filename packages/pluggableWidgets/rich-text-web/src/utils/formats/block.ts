import { Blot } from "parchment";
import Block from "quill/blots/block";

class MxBlock extends Block {
    isEmptyTailBlock(): boolean {
        const hasNoValidChildren =
            this.children.length === 0 ||
            (this.children.length === 1 && this.children.head?.statics.tagName?.toString().toUpperCase() === "BR");
        return hasNoValidChildren;
    }

    html(): string {
        // quill return empty paragraph when there is no content (just empty line)
        // to preserve the line breaks, we add empty space
        if (this.domNode.childElementCount === 1 && this.domNode.children[0] instanceof HTMLBRElement) {
            return this.domNode.outerHTML.replace(/<br>/g, "<br />");
        } else if (this.domNode.childElementCount === 0 && this.domNode.textContent?.trim() === "") {
            this.domNode.innerHTML = "<br />";
            return this.domNode.outerHTML;
        } else {
            return this.domNode.outerHTML;
        }
    }

    static IsMxBlock(blot: Blot | null): blot is MxBlock {
        return blot?.statics.blotName === "mx-block";
    }
}

MxBlock.blotName = "mx-block";
export default MxBlock;
