import { Scope, StyleAttributor } from "parchment";
import { CustomFontsType } from "../../../typings/RichTextProps";
import "./fonts.scss";

export const FONT_LIST = [
    { value: "andale-mono", description: "Andale Mono", style: "'andale mono', monospace" },
    { value: "arial", description: "Arial", style: "arial, helvetica, sans-serif" },
    { value: "arial-black", description: "Arial Black", style: "'arial black', sans-serif" },
    { value: "book-antiqua", description: "Book Antiqua", style: "'book antiqua', palatino, serif" },
    { value: "comic-sans", description: "Comic Sans MS", style: "'comic sans ms', sans-serif" },
    { value: "courier-new", description: "Courier New", style: "'courier new', courier, monospace" },
    { value: "helvetica", description: "Helvetica", style: "helvetica, arial, sans-serif" },
    { value: "impact", description: "Impact", style: "impact, sans-serif" },
    { value: "serif", description: "Serif", style: "serif" },
    { value: "symbol", description: "Symbol", style: "symbol" },
    { value: "terminal", description: "Terminal", style: "terminal, monaco, monospace" },
    { value: "times-new-roman", description: "Times New Roman", style: "'times new roman', times, serif" },
    { value: "trebuchet", description: "Trebuchet MS", style: "'trebuchet ms', geneva, sans-serif" }
];

const config = {
    scope: Scope.INLINE
};

export class FontStyleAttributor extends StyleAttributor {
    private fontList: typeof FONT_LIST = [];

    constructor(fontList: typeof FONT_LIST) {
        super("font", "font-family", config);
        this.fontList = fontList;
    }

    add(node: HTMLElement, value: any): boolean {
        if (!this.canAdd(node, value)) {
            return false;
        }
        node.dataset.value = value;
        const allFonts = [...FONT_LIST, ...this.fontList];
        const style = allFonts.find(x => x.value === value)?.style;
        if (style) {
            super.add(node, style);
        } else {
            return false;
        }
        return true;
    }

    value(node: HTMLElement): any {
        const value = node.dataset.value;
        if (this.canAdd(node, value) && value) {
            return value;
        }
        return "";
    }
}

export function formatCustomFonts(fonts: CustomFontsType[] = []): typeof FONT_LIST {
    return fonts.map(font => ({
        value: font.fontName?.toLowerCase().split(" ").join("-") ?? "",
        description: font.fontName ?? "",
        style: font.fontStyle ?? ""
    }));
}
