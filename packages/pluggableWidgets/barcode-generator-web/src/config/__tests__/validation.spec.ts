import { validateBarcodeValue, validateGs1DataMatrixValue } from "../validation";

describe("validateBarcodeValue - DataMatrix", () => {
    it("passes for an empty value (dynamic binding at runtime)", () => {
        expect(validateBarcodeValue("DataMatrix", "")).toEqual({ valid: true });
    });

    it("passes for a plain string", () => {
        expect(validateBarcodeValue("DataMatrix", "ABC-12345")).toEqual({ valid: true });
    });

    it("rejects an excessively long value", () => {
        const result = validateBarcodeValue("DataMatrix", "x".repeat(2001));
        expect(result.valid).toBe(false);
    });
});

describe("validateGs1DataMatrixValue", () => {
    it("passes for an empty value", () => {
        expect(validateGs1DataMatrixValue("")).toEqual({ valid: true });
    });

    it("passes for valid GS1 AI syntax", () => {
        expect(validateGs1DataMatrixValue("(01)09501101020917(17)261231(10)ABC123")).toEqual({ valid: true });
    });

    it("rejects a value that does not start with an Application Identifier", () => {
        expect(validateGs1DataMatrixValue("09501101020917").valid).toBe(false);
    });

    it("rejects an Application Identifier with no data", () => {
        expect(validateGs1DataMatrixValue("(01)(17)261231").valid).toBe(false);
    });

    it("rejects malformed / unbalanced parentheses", () => {
        expect(validateGs1DataMatrixValue("(01)09501101020917(17").valid).toBe(false);
    });
});
