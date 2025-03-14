import SnowTheme from "quill/themes/snow";
import MxTooltip from "./mxTooltip";
import icons from "quill/ui/icons";
import Toolbar from "quill/modules/toolbar";
import { Context } from "quill/modules/keyboard";
import Picker from "quill/ui/picker";
import { Range } from "quill";

const DEFAULT_FONT_SIZE = "14px";
const DEFAULT_FONT_FAMILY = "helvetica";

/**
 * Override quill's current theme.
 */
export default class MendixTheme extends SnowTheme {
    fontPicker?: Picker = undefined;
    fontSizePicker?: Picker = undefined;
    buildPickers(selects: NodeListOf<HTMLSelectElement>, icons: Record<string, string | Record<string, string>>): void {
        super.buildPickers(selects, icons);

        this.pickers.forEach(picker => {
            const pickerLabel = picker.container.querySelector(".ql-picker-label");
            if (picker.container.classList.contains("ql-size")) {
                picker.selectItem(
                    picker.container.querySelector(`[data-value="${DEFAULT_FONT_SIZE}"]`) as HTMLElement,
                    false
                );
                this.fontSizePicker = picker;
            }
            if (picker.container.classList.contains("ql-font")) {
                picker.selectItem(
                    picker.container.querySelector(`[data-value=${DEFAULT_FONT_FAMILY}]`) as HTMLElement,
                    false
                );
                this.fontPicker = picker;
            }
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
    updatePicker(range: Range): void {
        if (this.pickers) {
            const currentRange = range || { index: 0, length: 0 };

            const format = this.quill.getFormat(currentRange.index, currentRange.length);
            const font = format ? (format.font as string) : undefined;
            this.updateFontPicker(font || DEFAULT_FONT_FAMILY);
            const fontSize = format ? (format.size as string) : undefined;
            this.updateFontSizePicker(fontSize || DEFAULT_FONT_SIZE);
        }
    }

    updateFontPicker(font: string): void {
        if (this.pickers) {
            if (!this.fontPicker) {
                this.fontPicker = this.pickers.find(picker => picker.container.classList.contains("ql-font"));
            }

            const currentOption = this.fontPicker?.container.querySelector(`[data-value=${font}]`);
            if (currentOption) {
                this.fontPicker?.selectItem(currentOption as HTMLElement, false);
            }
        }
    }

    updateFontSizePicker(fontSize: string): void {
        if (this.pickers) {
            if (!this.fontSizePicker) {
                this.fontSizePicker = this.pickers.find(picker => picker.container.classList.contains("ql-size"));
            }

            const currentOption = this.fontSizePicker?.container.querySelector(`[data-value="${fontSize}"]`);
            if (currentOption) {
                this.fontSizePicker?.selectItem(currentOption as HTMLElement, false);
            }
        }
    }
}
