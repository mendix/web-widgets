import { Big } from "big.js";
import type { ParseResult, SimpleFormatter } from "mendix";
import { AttributeDef, attributeType, isNumeric } from "../store/schema.js";

function pad(n: number): string {
    return String(n).padStart(2, "0");
}

/** Deterministic en-US style formatting, so tests don't depend on the machine locale. */
export function formatterFor(def: AttributeDef): SimpleFormatter<any> {
    const type = attributeType(def);
    const invalid: ParseResult<any> = { valid: false };

    if (isNumeric(type)) {
        return {
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
        };
    }
    if (type === "DateTime") {
        return {
            format: (v?: Date) =>
                v === undefined
                    ? ""
                    : `${v.getMonth() + 1}/${v.getDate()}/${v.getFullYear()} ${pad(v.getHours())}:${pad(v.getMinutes())}`,
            parse: (text: string) => {
                const date = new Date(text);
                return isNaN(date.getTime()) ? invalid : { valid: true, value: date };
            }
        };
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
