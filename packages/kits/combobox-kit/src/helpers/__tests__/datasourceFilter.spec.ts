import { attribute, contains, literal, startsWith } from "mendix/filters/builders";
import { attrId } from "@mendix/widget-plugin-test-utils";
import { datasourceFilter } from "../datasourceFilter";

const id = attrId("caption");

describe("datasourceFilter", () => {
    beforeEach(() => {
        (attribute as jest.Mock).mockImplementation(a => ({ attr: a }));
        (literal as jest.Mock).mockImplementation(v => ({ lit: v }));
        (contains as jest.Mock).mockImplementation((a, b) => ({ contains: [a, b] }));
        (startsWith as jest.Mock).mockImplementation((a, b) => ({ startsWith: [a, b] }));
    });

    it("returns undefined for filter type 'none'", () => {
        expect(datasourceFilter("none", "ab", id)).toBeUndefined();
    });

    it("returns undefined for an empty search", () => {
        expect(datasourceFilter("contains", "", id)).toBeUndefined();
    });

    it.each(["contains", "containsExact"] as const)("builds a contains condition for '%s'", type => {
        expect(datasourceFilter(type, "ab", id)).toEqual({ contains: [{ attr: id }, { lit: "ab" }] });
    });

    it("builds a startsWith condition for 'startsWith'", () => {
        expect(datasourceFilter("startsWith", "ab", id)).toEqual({ startsWith: [{ attr: id }, { lit: "ab" }] });
    });
});
