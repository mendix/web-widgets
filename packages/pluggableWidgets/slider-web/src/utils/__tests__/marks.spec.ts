import { createMarks } from "../marks";

describe("createMarks", () => {
    it("forces trailing zeros when decimalPlaces > 0 and value is whole number", () => {
        const marks = createMarks({ numberOfMarks: 2, decimalPlaces: 2, decimalSeparator: ".", min: 0, max: 10 });
        expect(marks).toBeDefined();
        expect(marks![0]).toBe("0.00");
        expect(marks![5]).toBe("5.00");
        expect(marks![10]).toBe("10.00");
    });

    it("forces trailing zeros when decimalPlaces > 0 and value has fewer decimals", () => {
        const marks = createMarks({ numberOfMarks: 2, decimalPlaces: 2, decimalSeparator: ".", min: 0, max: 9.2 });
        expect(marks).toBeDefined();
        expect(marks![4.6]).toBe("4.60");
        expect(marks![9.2]).toBe("9.20");
    });

    it("does not add decimal places when decimalPlaces is 0", () => {
        const marks = createMarks({ numberOfMarks: 4, decimalPlaces: 0, decimalSeparator: ".", min: 0, max: 100 });
        expect(marks).toBeDefined();
        expect(marks![0]).toBe("0");
        expect(marks![25]).toBe("25");
        expect(marks![100]).toBe("100");
    });

    it("uses locale decimal separator", () => {
        const marks = createMarks({ numberOfMarks: 2, decimalPlaces: 2, decimalSeparator: ",", min: 0, max: 10 });
        expect(marks![0]).toBe("0,00");
        expect(marks![5]).toBe("5,00");
        expect(marks![10]).toBe("10,00");
    });

    it("uses correct numeric keys for fractional values with comma locale", () => {
        const marks = createMarks({ numberOfMarks: 2, decimalPlaces: 2, decimalSeparator: ",", min: 0, max: 9.2 });
        expect(marks![4.6]).toBe("4,60");
        expect(marks![9.2]).toBe("9,20");
    });

    it("returns undefined when numberOfMarks is 0", () => {
        expect(
            createMarks({ numberOfMarks: 0, decimalPlaces: 2, decimalSeparator: ".", min: 0, max: 100 })
        ).toBeUndefined();
    });

    it("returns undefined when min equals max", () => {
        expect(
            createMarks({ numberOfMarks: 4, decimalPlaces: 2, decimalSeparator: ".", min: 5, max: 5 })
        ).toBeUndefined();
    });

    it("returns undefined when min > max", () => {
        expect(
            createMarks({ numberOfMarks: 2, decimalPlaces: 1, decimalSeparator: ".", min: 10, max: 5 })
        ).toBeUndefined();
    });
});
