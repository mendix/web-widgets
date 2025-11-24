/*
 * Custom Clipboard module to override Quill's default clipboard behavior
 * to better handle pasting from various sources.
 * https://github.com/slab/quill/blob/main/packages/quill/src/modules/clipboard.ts
 */

import { EmbedBlot, type ScrollBlot } from "parchment";
import Quill, { Delta } from "quill";
import Clipboard, { matchNewline } from "quill/modules/clipboard";

function isLine(node: Node, scroll: ScrollBlot): boolean {
    if (!(node instanceof Element)) return false;
    const match = scroll.query(node);
    // @ts-expect-error prototype does not exist on Blot
    if (match && match.prototype instanceof EmbedBlot) return false;

    return [
        "address",
        "article",
        "blockquote",
        "canvas",
        "dd",
        "div",
        "dl",
        "dt",
        "fieldset",
        "figcaption",
        "figure",
        "footer",
        "form",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "header",
        "iframe",
        "li",
        "main",
        "nav",
        "ol",
        "output",
        "p",
        "pre",
        "section",
        "table",
        "td",
        "tr",
        "ul",
        "video"
    ].includes(node.tagName.toLowerCase());
}

function isBetweenInlineElements(node: HTMLElement, scroll: ScrollBlot): boolean | null {
    return (
        node.previousElementSibling &&
        node.nextElementSibling &&
        !isLine(node.previousElementSibling, scroll) &&
        !isLine(node.nextElementSibling, scroll)
    );
}

const preNodes = new WeakMap();
function isPre(node: Node | null): any {
    if (node == null) return false;
    if (!preNodes.has(node)) {
        // @ts-expect-error tagName does not exist on Node
        if (node.tagName === "PRE") {
            preNodes.set(node, true);
        } else {
            preNodes.set(node, isPre(node.parentNode));
        }
    }
    return preNodes.get(node);
}

// overrides matchText from Quill's Clipboard module
// removing text replacements that interfere with adding \t (tab)
function matchText(node: HTMLElement, delta: Delta, scroll: ScrollBlot): Delta {
    // @ts-expect-error data does not exist on HTMLElement
    let text = node.data as string;
    // Word represents empty line with <o:p>&nbsp;</o:p>
    if (node.parentElement?.tagName === "O:P") {
        return delta.insert(text.trim());
    }
    if (!isPre(node)) {
        if (text.trim().length === 0 && text.includes("\n") && !isBetweenInlineElements(node, scroll)) {
            return delta;
        }
        text = text.replace(/ {2,}/g, " ");
        if (
            (node.nextSibling == null && node.parentElement != null && isLine(node.parentElement, scroll)) ||
            (node.nextSibling instanceof Element && isLine(node.nextSibling, scroll))
        ) {
            // block structure means we don't need trailing space
            text = text.replace(/ $/, "");
        }
    }
    return delta.insert(text);
}

function matchList(node: HTMLElement, delta: Delta, _scroll: ScrollBlot): Delta {
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
}

export default class CustomClipboard extends Clipboard {
    constructor(quill: Quill, options: any) {
        super(quill, options);

        // remove default list matchers for ol and ul
        this.matchers = this.matchers.filter(matcher => matcher[0] !== "ol, ul" && matcher[0] !== Node.TEXT_NODE);
        this.addMatcher(Node.TEXT_NODE, matchNewline);
        this.addMatcher(Node.TEXT_NODE, matchText);
        // add custom list matchers for ol and ul to allow custom list types (lower-alpha, lower-roman, etc.)
        this.addMatcher("ol, ul", matchList);
    }
}
