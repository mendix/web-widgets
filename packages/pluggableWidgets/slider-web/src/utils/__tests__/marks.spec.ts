import { createMarks } from "../marks";

// Simple deterministic formatter standing in for createValueFormatter's output.
const formatWith =
    (decimalPlaces: number, decimalSeparator = ".") =>
    (value: number): string => {
        const fixed = value.toFixed(decimalPlaces);
        return decimalSeparator === "." ? fixed : fixed.replace(".", decimalSeparator);
    };

describe("createMarks", () => {
    it("forces trailing zeros when decimalPlaces > 0 and value is whole number", () => {
        const marks = createMarks({ numberOfMarks: 2, decimalPlaces: 2, format: formatWith(2), min: 0, max: 10 });
        expect(marks).toBeDefined();
        expect(marks![0]).toBe("0.00");
        expect(marks![5]).toBe("5.00");
        expect(marks![10]).toBe("10.00");
    });

    it("forces trailing zeros when decimalPlaces > 0 and value has fewer decimals", () => {
        const marks = createMarks({ numberOfMarks: 2, decimalPlaces: 2, format: formatWith(2), min: 0, max: 9.2 });
        expect(marks).toBeDefined();
        expect(marks![4.6]).toBe("4.60");
        expect(marks![9.2]).toBe("9.20");
    });

    it("does not add decimal places when decimalPlaces is 0", () => {
        const marks = createMarks({ numberOfMarks: 4, decimalPlaces: 0, format: formatWith(0), min: 0, max: 100 });
        expect(marks).toBeDefined();
        expect(marks![0]).toBe("0");
        expect(marks![25]).toBe("25");
        expect(marks![100]).toBe("100");
    });

    it("uses locale decimal separator", () => {
        const marks = createMarks({ numberOfMarks: 2, decimalPlaces: 2, format: formatWith(2, ","), min: 0, max: 10 });
        expect(marks![0]).toBe("0,00");
        expect(marks![5]).toBe("5,00");
        expect(marks![10]).toBe("10,00");
    });

    it("uses correct numeric keys for fractional values with comma locale", () => {
        const marks = createMarks({ numberOfMarks: 2, decimalPlaces: 2, format: formatWith(2, ","), min: 0, max: 9.2 });
        expect(marks![4.6]).toBe("4,60");
        expect(marks![9.2]).toBe("9,20");
    });

    it("rounds mark keys to the configured decimal places so dots align with their labels", () => {
        // 9 intervals over 0..20 yields repeating decimals (e.g. 6.6667). The key must be the
        // rounded value (6.7) so rc-slider positions the dot where the label reads.
        const marks = createMarks({ numberOfMarks: 9, decimalPlaces: 1, format: formatWith(1), min: 0, max: 20 });
        expect(Object.keys(marks!)).toContain("6.7");
        expect(Object.keys(marks!)).not.toContain("6.666666666666667");
        expect(marks![6.7]).toBe("6.7");
    });

    it("returns undefined when numberOfMarks is 0", () => {
        expect(
            createMarks({ numberOfMarks: 0, decimalPlaces: 2, format: formatWith(2), min: 0, max: 100 })
        ).toBeUndefined();
    });

    it("returns undefined when min equals max", () => {
        expect(
            createMarks({ numberOfMarks: 4, decimalPlaces: 2, format: formatWith(2), min: 5, max: 5 })
        ).toBeUndefined();
    });

    it("returns undefined when min > max", () => {
        expect(
            createMarks({ numberOfMarks: 2, decimalPlaces: 1, format: formatWith(1), min: 10, max: 5 })
        ).toBeUndefined();
    });
});
