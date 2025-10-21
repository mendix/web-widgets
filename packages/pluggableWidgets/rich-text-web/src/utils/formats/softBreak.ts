// import { BlockEmbed } from "quill/blots/block";
import { EmbedBlot } from "parchment";
/**
 * custom video link handler, allowing width and height config
 */
class SoftBreak extends EmbedBlot {
    static create(_value: unknown): Element {
        const node = super.create() as HTMLElement;
        return node;
    }
}

// SoftBreak.scope = Scope.INLINE_BLOT;
SoftBreak.blotName = "softbreak";
SoftBreak.tagName = "BR";

export default SoftBreak;
