import Quill, { Module } from "quill";
import { AttributorOptions } from "parchment";
const FontAttributor = Quill.import("attributors/class/font") as AttributorOptions;
import "./fonts.scss";

export const FONT_LIST = [
    { value: "andale-mono", description: "Andale Mono" }, // font-family: "andale mono", monospace;
    { value: "arial", description: "Arial" }, // arial, helvetica, sans-serif;
    { value: "arial-black", description: "Arial Black" }, // "arial black", sans-serif;
    { value: "book-antiqua", description: "Book Antiqua" }, // "book antiqua", palatino, serif;
    { value: "comic-sans", description: "Comic Sans MS" }, // "comic sans ms", sans-serif;
    { value: "courier-new", description: "Courier New" }, // "courier new", courier, monospace;
    { value: "helvetica", description: "Helvetica" },
    { value: "impact", description: "Impact" }, // "book antiqua", palatino, serif;
    { value: "serif", description: "Serif" },
    { value: "symbol", description: "Symbol" },
    { value: "terminal", description: "Terminal" },
    { value: "times-new-roman", description: "Times New Roman" },
    { value: "trebuchet", description: "Trebuchet MS" }
];

FontAttributor.whitelist = FONT_LIST.map(f => f.value);
Quill.register(FontAttributor as Record<string, Module>, true);
