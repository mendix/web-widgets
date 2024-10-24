/**
 * https://github.com/slab/quill/
Copyright (c) 2017-2024, Slab
Copyright (c) 2014, Jason Chen
Copyright (c) 2013, salesforce.com
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 * 
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
            // modified by web-content: adding new line \n
            return `</li></${endTag}>\n`;
        }
        // modified by web-content: adding new line \n
        return `</li></${endTag}>\n${convertListHTML([], lastIndent - 1, types)}`;
    }
    const [{ child, offset, length, indent, type }, ...rest] = items;
    const [tag, attribute] = getListType(type);
    // modified by web-content: get proper list-style-type
    const expectedType = getExpectedType(type, indent);
    if (indent > lastIndent) {
        types.push(type);
        if (indent === lastIndent + 1) {
            // modified by web-content: adding list-style-type to allow retaining list style when converted to html and new line \n
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
        // modified by web-content: adding new line \n
        return `</li>\n<li${attribute}>${convertHTML(child, offset, length)}${convertListHTML(rest, indent, types)}`;
    }
    const [endTag] = getListType(types.pop());
    // modified by web-content: adding new line \n
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
