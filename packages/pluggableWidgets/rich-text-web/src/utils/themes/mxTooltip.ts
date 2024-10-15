import { Range } from "quill/core";
import Emitter from "quill/core/emitter";
import LinkBlot from "quill/formats/link";
import { BaseTooltip } from "quill/themes/base";
import { linkConfigType } from "../formats";

export default class MxTooltip extends BaseTooltip {
    static TEMPLATE = [
        '<a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank" aria-label="preview"></a>',
        '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">',
        '<a class="ql-action" aria-label="edit"></a>',
        '<a class="ql-remove" aria-label="remove"></a>'
    ].join("");

    preview = this.root.querySelector("a.ql-preview");
    linkDOMNode = this.root.querySelector("a.ql-preview");

    listen(): void {
        super.listen();
        // @ts-expect-error Fix me later
        this.root.querySelector("a.ql-action").addEventListener("click", event => {
            if (this.root.classList.contains("ql-editing")) {
                this.save();
            } else {
                // @ts-expect-error Fix me later
                console.log("[DEV]", this.preview.textContent);
                // @ts-expect-error Fix me later
                this.edit("link", this.preview.textContent);
            }
            event.preventDefault();
        });
        // @ts-expect-error Fix me later
        this.root.querySelector("a.ql-remove").addEventListener("click", event => {
            if (this.linkRange != null) {
                const range = this.linkRange;
                this.restoreFocus();
                this.quill.formatText(range, "link", false, Emitter.sources.USER);
                delete this.linkRange;
            }
            event.preventDefault();
            this.hide();
        });
        this.quill.on(Emitter.events.SELECTION_CHANGE, (range, _oldRange, source) => {
            if (range == null) {
                return;
            }
            if (range.length === 0 && source === Emitter.sources.USER) {
                const [link, offset] = this.quill.scroll.descendant(LinkBlot, range.index);
                if (link != null) {
                    this.linkRange = new Range(range.index - offset, link.length());
                    if (link.domNode && link.domNode instanceof HTMLAnchorElement) {
                        this.linkDOMNode = link.domNode;
                    }
                    const preview = LinkBlot.formats(link.domNode);
                    // @ts-expect-error Fix me later
                    this.preview.textContent = preview;
                    // @ts-expect-error Fix me later
                    this.preview.setAttribute("href", preview);
                    this.show();
                    const bounds = this.quill.getBounds(this.linkRange);
                    if (bounds != null) {
                        this.position(bounds);
                    }
                    return;
                }
            } else {
                delete this.linkRange;
            }
            this.hide();
        });
    }

    edit(mode = "link", preview: string | null = null): void {
        if (mode === "link") {
            if (this.linkRange) {
                this.quill.setSelection(this.linkRange);
                const linkConfig: linkConfigType = {
                    text: this.linkDOMNode?.textContent ?? undefined,
                    href: this.linkDOMNode?.getAttribute("href") ?? "",
                    title: this.linkDOMNode?.getAttribute("title") ?? undefined,
                    target: this.linkDOMNode?.getAttribute("target") ?? undefined
                };
                this.quill.emitter.emit("EDIT-TOOLTIP", linkConfig);
            }
        } else {
            super.edit(mode, preview);
        }
    }

    show(): void {
        super.show();
        this.root.removeAttribute("data-mode");
    }
}
