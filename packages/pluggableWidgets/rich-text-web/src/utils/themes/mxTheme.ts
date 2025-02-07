import SnowTheme from "quill/themes/snow";
import MxTooltip from "./mxTooltip";
import icons from "quill/ui/icons";
import Toolbar from "quill/modules/toolbar";
import { Context } from "quill/modules/keyboard";
import Picker from "quill/ui/picker";
import { Range } from "quill";

/**
 * Override quill's current theme.
 */
export default class MendixTheme extends SnowTheme {
    fontPicker?: Picker = undefined;
    buildPickers(selects: NodeListOf<HTMLSelectElement>, icons: Record<string, string | Record<string, string>>): void {
        super.buildPickers(selects, icons);

        this.pickers.forEach(picker => {
            const pickerLabel = picker.container.querySelector(".ql-picker-label");
            if (pickerLabel) {
                pickerLabel.setAttribute("tabindex", "-1");
            }
        });
    }

    /**
     * copied from https://github.com/slab/quill/blob/main/packages/quill/src/themes/snow.ts
     * with modification to replace tooltip with MxTooltip
     * @param toolbar
     */
    extendToolbar(toolbar: Toolbar): void {
        if (toolbar.container != null) {
            toolbar.container.classList.add("ql-snow");
            this.buildButtons(toolbar.container.querySelectorAll("button"), icons);
            this.buildPickers(toolbar.container.querySelectorAll("select"), icons);
            // @ts-expect-error unknown type
            this.tooltip = new MxTooltip(this.quill, this.options.bounds);
            if (toolbar.container.querySelector(".ql-link")) {
                this.quill.keyboard.addBinding({ key: "k", shortKey: true }, (_range: Range, context: Context) => {
                    toolbar.handlers.link.call(toolbar, !context.format.link);
                });
            }
        }
    }

    /** updating font picker selected item based on current's selection font */
    updateFontPicker(range: Range): void {
        if (this.pickers) {
            const currentRange = range || { index: 0, length: 0 };
            if (!this.fontPicker) {
                this.fontPicker = this.pickers.find(picker => picker.container.classList.contains("ql-font"));
            }

            const format = this.quill.getFormat(currentRange.index, currentRange.length);
            let font = format ? (format.font as string) : undefined;
            if (!font) {
                // default font
                font = "helvetica";
            }

            const currentOption = this.fontPicker?.container.querySelector(`[data-value=${font}]`);
            if (currentOption) {
                this.fontPicker?.selectItem(currentOption as HTMLElement, false);
            }
        }
    }
}
