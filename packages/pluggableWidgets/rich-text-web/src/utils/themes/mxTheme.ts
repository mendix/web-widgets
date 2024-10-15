import SnowTheme from "quill/themes/snow";
import MxTooltip from "./mxTooltip";
import icons from "quill/ui/icons";
import Toolbar from "quill/modules/toolbar";
import { Context } from "quill/modules/keyboard";

/**
 * Override quill's current theme.
 */
export default class MendixTheme extends SnowTheme {
    buildPickers(selects: NodeListOf<HTMLSelectElement>, icons: Record<string, string | Record<string, string>>): void {
        super.buildPickers(selects, icons);
    }

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
}
