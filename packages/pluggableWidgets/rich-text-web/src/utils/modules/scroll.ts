import Scroll from "quill/blots/scroll";
import MxBlock from "../formats/block";

export default class MxScroll extends Scroll {
    optimize(context?: { [key: string]: any }): void;
    optimize(mutations?: MutationRecord[], context?: { [key: string]: any }): void;
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    optimize(mutations = [], context = {}) {
        // remove multiple empty line placed in the end
        // this is usually occurs with multi level ListContainer
        if (
            this.children.tail &&
            MxBlock.IsEmptyBlock(this.children.tail) &&
            MxBlock.IsEmptyBlock(this.children.tail.prev)
        ) {
            this.children.tail.parent.removeChild(this.children.tail);
        }
        super.optimize(mutations, context);
    }
}
