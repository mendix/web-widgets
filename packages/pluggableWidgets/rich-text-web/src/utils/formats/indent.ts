import { ClassAttributor, Scope } from "parchment";
import "./fonts.scss";

const INDENT_MAGIC_NUMBER = 3;
const indentLists = ["3", "6", "9", "12", "15", "18", "21", "24", "27"];

/**
 *  overriding current quill's indent format by using CSS classes instead of inline styles
 *  toolbar's indent button also have to be overriden using getIndentHandler
 */
class IndentAttributor extends ClassAttributor {
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
        return super.add(node, `${normalizedValue}`);
    }

    canAdd(node: HTMLElement, value: string): boolean {
        return super.canAdd(node, value);
    }

    value(node: HTMLElement): number | undefined {
        const val = super.value(node);
        return val ? parseInt(val, 10) : undefined;
    }
}

export const IndentLeftClass = new IndentAttributor("indent-left", "ql-indent-left", {
    scope: Scope.BLOCK,
    whitelist: indentLists
});

export const IndentRightClass = new IndentAttributor("indent-right", "ql-indent-right", {
    scope: Scope.BLOCK,
    whitelist: indentLists
});
