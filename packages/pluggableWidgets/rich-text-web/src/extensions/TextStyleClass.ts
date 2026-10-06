import { TextStyle, TextStyleOptions } from "@tiptap/extension-text-style";

export interface TextStyleClassOptions extends TextStyleOptions {
    styleDataFormat: "inline" | "class";
}

// Spans written in class mode by TextColorClass, FontFamilyClass and FontSize.
const CLASS_FORMAT_SPAN = "span[data-text-color], span[data-font-family], span[data-font-size]";

/**
 * TextStyle only parses spans that carry a `style` attribute. In class mode the text
 * color, font family and font size are stored as data-* attributes without inline style,
 * so those spans must be recognised as textStyle marks too.
 */
export const TextStyleClass = TextStyle.extend<TextStyleClassOptions>({
    addOptions() {
        return {
            ...this.parent!(),
            styleDataFormat: "inline"
        };
    },

    parseHTML() {
        const rules = this.parent?.() ?? [];
        if (this.options.styleDataFormat !== "class") {
            return rules;
        }

        return [
            ...rules,
            {
                tag: CLASS_FORMAT_SPAN,
                consuming: false,
                // Spans with inline style are already handled by the default rule.
                getAttrs: element => (element.hasAttribute("style") ? false : {})
            }
        ];
    }
});
