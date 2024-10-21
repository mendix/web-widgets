/**
 * this file overrides Quill instance.
 * allowing us to override certain function that is not easy to extend.
 */
import { type Blot, ParentBlot } from "parchment";
import Quill, { QuillOptions } from "quill";
import TextBlot, { escapeText } from "quill/blots/text";
import Editor from "quill/core/editor";

/**
 * Rich Text's extended Quill Editor
 * allowing us to override certain editor's function, such as: getHTML
 */
class MxEditor extends Editor {
    /**
     * copied without modification from Quill's editor
     * https://github.com/slab/quill/blob/main/packages/quill/src/core/editor.ts
     */
    getHTML(index: number, length: number): string {
        const [line, lineOffset] = this.scroll.line(index);
        if (line) {
            const lineLength = line.length();
            const isWithinLine = line.length() >= lineOffset + length;
            if (isWithinLine && !(lineOffset === 0 && length === lineLength)) {
                return convertHTML(line, lineOffset, length, true);
            }
            return convertHTML(this.scroll, index, length, true);
        }
        return "";
    }
}

/**
 * Extension's of quill to allow us replacing the editor instance.
 */
export default class MxQuill extends Quill {
    constructor(container: HTMLElement | string, options: QuillOptions = {}) {
        super(container, options);
        this.editor = new MxEditor(this.scroll);
    }
}

/**
 * copied without modification from Quill's editor
 * https://github.com/slab/quill/blob/main/packages/quill/src/core/editor.ts
 */
function getListType(type: string | undefined): [tag: string, attr: string] {
    const tag = type === "ordered" ? "ol" : "ul";
    switch (type) {
        case "checked":
            return [tag, ' data-list="checked"'];
        case "unchecked":
            return [tag, ' data-list="unchecked"'];
        default:
            return [tag, ""];
    }
}

// based on LIST_STYLE variables sequence in https://github.com/slab/quill/blob/main/packages/quill/src/assets/core.styl
const ListSequence = ["ordered", "lower-alpha", "lower-roman"];

// construct proper "list-style-type" style attribute
function getExpectedType(type: string | undefined, indent: number): string {
    const currentIndex = ListSequence.indexOf(type || "ordered");
    const expectedIndex = (currentIndex + indent) % 3;
    const expectedType = ListSequence[expectedIndex] ?? type;
    return expectedType === "ordered" ? "decimal" : expectedType === "bullet" ? "disc" : expectedType;
}

/**
 * Copy with modification from https://github.com/slab/quill/blob/main/packages/quill/src/core/editor.ts
 */
function convertListHTML(items: any[], lastIndent: number, types: string[]): string {
    if (items.length === 0) {
        const [endTag] = getListType(types.pop());
        if (lastIndent <= 0) {
            return `</li></${endTag}>\n`;
        }
        return `</li></${endTag}>\n${convertListHTML([], lastIndent - 1, types)}`;
    }
    const [{ child, offset, length, indent, type }, ...rest] = items;
    const [tag, attribute] = getListType(type);
    // modified by web-content: get proper list-style-type
    const expectedType = getExpectedType(type, indent);
    if (indent > lastIndent) {
        types.push(type);
        if (indent === lastIndent + 1) {
            // modified by web-content: adding list-style-type to allow retaining list style when converted to html
            return `<${tag} style="list-style-type: ${expectedType}">\n<li${attribute}>${convertHTML(
                child,
                offset,
                length
            )}${convertListHTML(rest, indent, types)}`;
        }
        return `<${tag}><li>${convertListHTML(items, lastIndent + 1, types)}`;
    }
    const previousType = types[types.length - 1];
    if (indent === lastIndent && type === previousType) {
        return `</li>\n<li${attribute}>${convertHTML(child, offset, length)}${convertListHTML(rest, indent, types)}`;
    }
    const [endTag] = getListType(types.pop());
    return `</li></${endTag}>\n${convertListHTML(items, lastIndent - 1, types)}`;
}

/**
 * copied without modification from Quill's editor
 * https://github.com/slab/quill/blob/main/packages/quill/src/core/editor.ts
 * allowing us to use our own convertListHTML function.
 */
function convertHTML(blot: Blot, index: number, length: number, isRoot = false): string {
    if ("html" in blot && typeof blot.html === "function") {
        return blot.html(index, length);
    }
    if (blot instanceof TextBlot) {
        return escapeText(blot.value().slice(index, index + length));
    }
    if (blot instanceof ParentBlot) {
        // TODO fix API
        if (blot.statics.blotName === "list-container") {
            const items: any[] = [];
            blot.children.forEachAt(index, length, (child, offset, childLength) => {
                const formats = "formats" in child && typeof child.formats === "function" ? child.formats() : {};
                items.push({
                    child,
                    offset,
                    length: childLength,
                    indent: formats.indent || 0,
                    type: formats.list
                });
            });
            return convertListHTML(items, -1, []);
        }
        const parts: string[] = [];
        blot.children.forEachAt(index, length, (child, offset, childLength) => {
            parts.push(convertHTML(child, offset, childLength));
        });
        if (isRoot || blot.statics.blotName === "list") {
            return parts.join("");
        }
        const { outerHTML, innerHTML } = blot.domNode as Element;
        const [start, end] = outerHTML.split(`>${innerHTML}<`);
        // TODO cleanup
        if (start === "<table") {
            return `<table style="border: 1px solid #000;">${parts.join("")}<${end}`;
        }
        return `${start}>${parts.join("")}<${end}\n`;
    }
    return blot.domNode instanceof Element ? blot.domNode.outerHTML : "";
}
