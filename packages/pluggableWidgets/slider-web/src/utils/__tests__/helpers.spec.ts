import { Big } from "big.js";
import { NumberFormatter } from "mendix";
import { createValueFormatter } from "../helpers";

/**
 * Minimal stand-in for the Mendix runtime NumberFormatter. It mimics the two behaviours the
 * widget relies on: `withConfig` returns a new formatter with the merged config, and `format`
 * honours `decimalPrecision`, `groupDigits` and the configured locale separators.
 */
function fakeNumberFormatter(
    config: { groupDigits: boolean; decimalPrecision?: number },
    locale: { decimal: string; group: string } = { decimal: ".", group: "," }
): NumberFormatter {
    return {
        type: "number",
        config,
        withConfig: (next: { groupDigits: boolean; decimalPrecision?: number }) =>
            fakeNumberFormatter({ ...config, ...next }, locale),
        format: (value?: Big) => {
            if (value == null) {
                return "";
            }
            const fixed = value.toNumber().toFixed(config.decimalPrecision ?? 0);
            const [intPart, fracPart] = fixed.split(".");
            const grouped = config.groupDigits ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, locale.group) : intPart;
            return fracPart != null ? `${grouped}${locale.decimal}${fracPart}` : grouped;
        },
        parse: () => ({ valid: false })
    } as unknown as NumberFormatter;
}

describe("createValueFormatter", () => {
    it("redefines the formatter's decimal precision (forces trailing zeros)", () => {
        const format = createValueFormatter(fakeNumberFormatter({ groupDigits: false }), 2);
        expect(format(10)).toBe("10.00");
        expect(format(9.2)).toBe("9.20");
    });

    it("formats without decimals when decimalPlaces is 0", () => {
        const format = createValueFormatter(fakeNumberFormatter({ groupDigits: false }), 0);
        expect(format(10)).toBe("10");
        expect(format(9.7)).toBe("10");
    });

    it("respects the locale decimal separator from the formatter", () => {
        const format = createValueFormatter(
            fakeNumberFormatter({ groupDigits: false }, { decimal: ",", group: "." }),
            2
        );
        expect(format(9.2)).toBe("9,20");
    });

    it("keeps the attribute's thousands grouping when groupDigits is enabled", () => {
        const format = createValueFormatter(fakeNumberFormatter({ groupDigits: true }), 0);
        expect(format(1000000)).toBe("1,000,000");
    });

    it("omits thousands grouping when groupDigits is disabled", () => {
        const format = createValueFormatter(fakeNumberFormatter({ groupDigits: false }), 0);
        expect(format(1000000)).toBe("1000000");
    });
});
