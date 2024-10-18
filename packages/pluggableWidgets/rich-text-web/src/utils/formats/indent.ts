import { Scope, StyleAttributor } from "parchment";
import "./fonts.scss";

const INDENT_MAGIC_NUMBER = 3;
const indentLists = ["3em", "6em", "9em", "12em", "15em", "18em", "21em", "24em", "27em"];

/**
 *  overriding current quill's indent format by using inline style instead of classname
 *  toolbar's indent button also have to be overriden using getIndentHandler
 */
class IndentAttributor extends StyleAttributor {
    add(node: HTMLElement, value: string | number): boolean {
        let normalizedValue = 0;
        if (value === "+1" || value === "-1") {
            const indent = this.value(node) || 0;
            normalizedValue = value === "+1" ? indent + INDENT_MAGIC_NUMBER : indent - INDENT_MAGIC_NUMBER;
        } else if (typeof value === "number") {
            const modValue = value % INDENT_MAGIC_NUMBER;
            const indent = this.value(node) || 0;
            normalizedValue =
                indent +
                (modValue === 1
                    ? INDENT_MAGIC_NUMBER
                    : modValue === 2 || modValue === -1
                    ? -INDENT_MAGIC_NUMBER
                    : value);
        }
        if (normalizedValue === 0) {
            this.remove(node);
            return true;
        }
        return super.add(node, `${normalizedValue}em`);
    }

    canAdd(node: HTMLElement, value: string): boolean {
        return super.canAdd(node, value);
    }

    value(node: HTMLElement): number | undefined {
        return parseInt(super.value(node).replace("em", ""), 10) || undefined; // Don't return NaN
    }
}

export const IndentLeftStyle = new IndentAttributor("indent-left", "padding-left", {
    scope: Scope.BLOCK,
    whitelist: indentLists
});

export const IndentRightStyle = new IndentAttributor("indent-right", "padding-right", {
    scope: Scope.BLOCK,
    whitelist: indentLists
});
