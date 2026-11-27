import { Big } from "big.js";
import type { ParseResult, SimpleFormatter } from "mendix";
import { AttributeDef, attributeType, isNumeric } from "../store/schema.js";

export type HarnessFormatter = SimpleFormatter<any> & {
    readonly type?: "number" | "datetime";
    readonly config?: Record<string, unknown>;
    withConfig?: (config: Record<string, unknown>) => HarnessFormatter;
};

function typed(
    type: "number" | "datetime",
    formatter: SimpleFormatter<any>,
    config: Record<string, unknown>
): HarnessFormatter {
    return { ...formatter, type, config, withConfig: next => typed(type, formatter, { ...config, ...next }) };
}

/**
 * Deterministic en-US style formatting, so tests don't depend on the machine locale.
 * Numeric and date attributes carry a typed formatter (`type` "number" / "datetime"), as in the Mendix client.
 */
export function formatterFor(def: AttributeDef): HarnessFormatter {
    const type = attributeType(def);
    const invalid: ParseResult<any> = { valid: false };

    if (isNumeric(type)) {
        return typed(
            "number",
            {
                format: (v?: Big) => (v === undefined ? "" : v.toString()),
                parse: (text: string) => {
                    if (text.trim() === "") {
                        return { valid: true, value: undefined };
                    }
                    try {
                        return { valid: true, value: new Big(text) };
                    } catch {
                        return invalid;
                    }
                }
            },
            { groupDigits: false }
        );
    }
    if (type === "DateTime") {
        return typed(
            "datetime",
            {
                format: (v?: Date) => (v === undefined ? "" : `${v.getMonth() + 1}/${v.getDate()}/${v.getFullYear()}`),
                parse: (text: string) => {
                    const date = new Date(text);
                    return isNaN(date.getTime()) ? invalid : { valid: true, value: date };
                }
            },
            { type: "date" }
        );
    }
    if (type === "Boolean") {
        return {
            format: (v?: boolean) => (v === undefined ? "" : v ? "Yes" : "No"),
            parse: (text: string) => ({ valid: true, value: text === "Yes" || text === "true" })
        };
    }
    if (typeof def === "object") {
        const captions = def.values;
        return {
            format: (v?: string) => (v === undefined ? "" : (captions[v] ?? v)),
            parse: (text: string) => {
                const key = Object.keys(captions).find(k => captions[k] === text || k === text);
                return key === undefined ? invalid : { valid: true, value: key };
            }
        };
    }
    return {
        format: (v?: string) => v ?? "",
        parse: (text: string) => ({ valid: true, value: text })
    };
}
