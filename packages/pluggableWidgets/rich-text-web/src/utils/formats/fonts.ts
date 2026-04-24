import { ClassAttributor, Scope } from "parchment";
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

export class FontClassAttributor extends ClassAttributor {
    constructor(fontList: typeof FONT_LIST) {
        super("font", "ql-font", config);
        // Dynamically inject CSS for custom fonts
        this.injectCustomFontStyles(fontList);
    }

    private injectCustomFontStyles(fontList: typeof FONT_LIST): void {
        if (fontList.length === 0) return;

        // Check if style already exists
        const styleId = "rich-text-custom-fonts";
        if (document.getElementById(styleId)) return;

        // Create CSS rules for custom fonts
        const cssRules = fontList
            .map(font => `.widget-rich-text .ql-font-${font.value} { font-family: ${font.style}; }`)
            .join("\n");

        // Inject style element
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = cssRules;
        document.head.appendChild(style);
    }
}

export function formatCustomFonts(fonts: CustomFontsType[] = []): typeof FONT_LIST {
    return fonts.map(font => ({
        value: font.fontName?.toLowerCase().split(" ").join("-") ?? "",
        description: font.fontName ?? "",
        style: font.fontStyle ?? ""
    }));
}
