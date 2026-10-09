import { CustomFontsType } from "../../../../typings/RichTextProps";
import { normalizeCssSize } from "../../../utils/helpers";
import { ToolbarButtonConfig } from "../ToolbarConfig";

export interface DefaultFonts {
    fontFamily?: string;
    fontSize?: string;
}

export const FONT_LIST = [
    { value: "Default", description: "Default", style: "" },
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

export const FONT_SIZE_LIST = [
    "8px",
    "9px",
    "10px",
    "12px",
    "14px",
    "16px",
    "20px",
    "24px",
    "32px",
    "42px",
    "54px",
    "68px",
    "84px",
    "98px"
];

export function AddCustomFontsToFontFamilyDropdown(
    fontFamilyButton: ToolbarButtonConfig,
    customFonts: CustomFontsType[]
): ToolbarButtonConfig {
    if (!customFonts || customFonts.length === 0) {
        return fontFamilyButton;
    }

    // Map valid custom fonts to dropdown options
    const customFontOptions = customFonts.map(font => {
        // Transform font name to kebab-case value
        // "Roboto" → "roboto"
        // "Times New Roman" → "times-new-roman"
        const value = font.fontName.toLowerCase().replace(/\s+/g, "-");

        return {
            value,
            label: font.fontName,
            attrs: {
                fontFamily: font.fontStyle,
                fontValue: value
            },
            command: "setFontFamily"
        };
    });

    const allOptions = [...(fontFamilyButton.dropdownOptions || []), ...customFontOptions];

    // Sort alphabetically, keeping "Default" first
    const defaultOpt = allOptions.find(opt => opt.value === "Default");
    const sortedOthers = allOptions
        .filter(opt => opt.value !== "Default")
        .sort((a, b) => a.label.localeCompare(b.label));

    return {
        ...fontFamilyButton,
        dropdownOptions: defaultOpt ? [defaultOpt, ...sortedOthers] : sortedOthers
    };
}

/**
 * Resolves a configured default to the value of one of the dropdown's options, so the dropdown
 * can show it. Font families match by option value or font name ("Times New Roman",
 * "times-new-roman"); sizes match after normalizing bare numbers to px ("14" -> "14px").
 * Returns undefined when no option matches.
 */
function findDefaultOptionValue(button: ToolbarButtonConfig, configured: string): string | undefined {
    const input = configured.trim().toLowerCase();
    if (!input) {
        return undefined;
    }
    const candidates = button.name === "fontSize" ? [normalizeCssSize(input)] : [input, input.replace(/\s+/g, "-")];

    return button.dropdownOptions?.find(
        option =>
            option.value !== "Default" &&
            (candidates.includes(option.value.toLowerCase()) || option.label.toLowerCase() === input)
    )?.value;
}

/**
 * Makes the font family / font size dropdown show the configured default while the selection
 * has no explicit font family / font size. Display only: the default is never applied to the content.
 */
export function AddDefaultFontToDropdown(button: ToolbarButtonConfig, defaultFonts: DefaultFonts): ToolbarButtonConfig {
    const configured = button.name === "fontFamily" ? defaultFonts.fontFamily : defaultFonts.fontSize;
    const getCurrentValue = button.getCurrentValue;
    const defaultValue = configured && getCurrentValue ? findDefaultOptionValue(button, configured) : undefined;
    if (!defaultValue || !getCurrentValue) {
        return button;
    }

    return {
        ...button,
        getCurrentValue: editor => {
            const { fontFamily, fontValue, fontSize } = editor.getAttributes("textStyle");
            const hasMark = button.name === "fontFamily" ? !!(fontValue || fontFamily) : !!fontSize;
            return hasMark ? getCurrentValue(editor) : defaultValue;
        }
    };
}
