import { parsePagingAlignment } from "../pagingAlignment";

describe("parsePagingAlignment", () => {
    it.each([
        ["widget-gallery-pagination-left", "left"],
        ["widget-gallery-pagination-center", "center"],
        ["widget-gallery-pagination-right", "right"]
    ] as const)("resolves %s to %s", (className, expected) => {
        expect(parsePagingAlignment(className)).toBe(expected);
    });

    it("finds the alignment class among unrelated classes", () => {
        expect(parsePagingAlignment("widget-gallery-striped my-class widget-gallery-pagination-center")).toBe("center");
    });

    it("ignores unrelated classes", () => {
        expect(parsePagingAlignment("widget-gallery-striped widget-gallery-hover")).toBe("right");
    });

    it("falls back to right when no class is set", () => {
        expect(parsePagingAlignment(undefined)).toBe("right");
        expect(parsePagingAlignment("")).toBe("right");
    });

    it("ignores classes that merely contain an alignment class name", () => {
        expect(parsePagingAlignment("prefixed-widget-gallery-pagination-left")).toBe("right");
    });

    it("resolves deterministically when several alignment classes are present", () => {
        expect(parsePagingAlignment("widget-gallery-pagination-right widget-gallery-pagination-left")).toBe("left");
        expect(parsePagingAlignment("widget-gallery-pagination-center widget-gallery-pagination-left")).toBe("left");
    });

    it("tolerates irregular whitespace", () => {
        expect(parsePagingAlignment("  widget-gallery-striped   widget-gallery-pagination-center  ")).toBe("center");
    });
});
