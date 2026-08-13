import { getRowAriaSelected } from "../get-row-aria-selected";

describe("getRowAriaSelected", () => {
    describe("when the row has a selection checkbox", () => {
        it("omits aria-selected so the state is not announced twice", () => {
            expect(getRowAriaSelected("Multi", true, true)).toBeUndefined();
            expect(getRowAriaSelected("Multi", false, true)).toBeUndefined();
            expect(getRowAriaSelected("Single", true, true)).toBeUndefined();
        });
    });

    describe("when the row has no selection checkbox", () => {
        it("reflects the selection state, as aria-selected is the only carrier", () => {
            expect(getRowAriaSelected("Multi", true, false)).toBe(true);
            expect(getRowAriaSelected("Multi", false, false)).toBe(false);
            expect(getRowAriaSelected("Single", true, false)).toBe(true);
            expect(getRowAriaSelected("Single", false, false)).toBe(false);
        });
    });

    describe("when selection is disabled", () => {
        it("omits aria-selected", () => {
            expect(getRowAriaSelected("None", false, false)).toBeUndefined();
            expect(getRowAriaSelected("None", false, true)).toBeUndefined();
        });
    });
});
