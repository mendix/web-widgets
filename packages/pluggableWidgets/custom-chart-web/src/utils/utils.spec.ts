import { parseConfig, parseData, parseLayout } from "../utils/utils";

describe("parseData", () => {
    it("returns empty array when all inputs are empty", () => {
        expect(parseData()).toEqual([]);
    });

    it("parses staticData only", () => {
        const staticData = JSON.stringify([{ x: [1], y: [2] }]);
        expect(parseData(staticData)).toEqual([{ x: [1], y: [2] }]);
    });

    it("parses attributeData only", () => {
        const attributeData = JSON.stringify([{ x: [5], y: [6] }]);
        expect(parseData(undefined, attributeData)).toEqual([{ x: [5], y: [6] }]);
    });

    it("merges static and attribute traces by index with equal lengths", () => {
        const staticData = JSON.stringify([
            { type: "bar", x: [1, 2, 3] },
            { type: "line", x: [4, 5, 6] }
        ]);
        const attributeData = JSON.stringify([{ y: [10, 20, 30] }, { y: [40, 50, 60] }]);
        expect(parseData(staticData, attributeData)).toEqual([
            { type: "bar", x: [1, 2, 3], y: [10, 20, 30] },
            { type: "line", x: [4, 5, 6], y: [40, 50, 60] }
        ]);
    });

    it("attribute data overrides static properties", () => {
        const staticData = JSON.stringify([{ name: "static", x: [1, 2] }]);
        const attributeData = JSON.stringify([{ name: "attribute", y: [3, 4] }]);
        expect(parseData(staticData, attributeData)).toEqual([{ name: "attribute", x: [1, 2], y: [3, 4] }]);
    });

    it("appends extra static traces when static has more traces", () => {
        const staticData = JSON.stringify([
            { type: "bar", x: [1] },
            { type: "line", x: [2] },
            { type: "scatter", x: [3] }
        ]);
        const attributeData = JSON.stringify([{ y: [10] }]);
        expect(parseData(staticData, attributeData)).toEqual([
            { type: "bar", x: [1], y: [10] },
            { type: "line", x: [2] },
            { type: "scatter", x: [3] }
        ]);
    });

    it("appends extra attribute traces when attribute has more traces", () => {
        const staticData = JSON.stringify([{ type: "bar", x: [1] }]);
        const attributeData = JSON.stringify([{ y: [10] }, { y: [20] }, { y: [30] }]);
        expect(parseData(staticData, attributeData)).toEqual([
            { type: "bar", x: [1], y: [10] },
            { y: [20] },
            { y: [30] }
        ]);
    });

    it("returns empty array on invalid JSON", () => {
        expect(parseData("invalid json")).toEqual([]);
    });

    it("merges sampleData with static when attributeData is empty", () => {
        const staticData = JSON.stringify([{ type: "bar", x: [1, 2, 3] }]);
        const sampleData = JSON.stringify([{ y: [10, 20, 30] }]);
        expect(parseData(staticData, undefined, sampleData)).toEqual([{ type: "bar", x: [1, 2, 3], y: [10, 20, 30] }]);
    });

    it("ignores sampleData when attributeData is present", () => {
        const staticData = JSON.stringify([{ type: "bar", x: [1] }]);
        const attributeData = JSON.stringify([{ y: [10] }]);
        const sampleData = JSON.stringify([{ y: [99], name: "sample" }]);
        expect(parseData(staticData, attributeData, sampleData)).toEqual([{ type: "bar", x: [1], y: [10] }]);
    });

    it("uses sampleData only when attributeData is empty array string", () => {
        const staticData = JSON.stringify([{ type: "line", x: [1] }]);
        const attributeData = JSON.stringify([]);
        const sampleData = JSON.stringify([{ y: [5] }]);
        expect(parseData(staticData, attributeData, sampleData)).toEqual([{ type: "line", x: [1], y: [5] }]);
    });
});

describe("parseLayout", () => {
    it("returns empty object when all inputs are empty", () => {
        expect(parseLayout()).toEqual({});
    });

    it("parses staticLayout only", () => {
        const staticLayout = JSON.stringify({ title: "Test" });
        expect(parseLayout(staticLayout)).toEqual({ title: "Test" });
    });

    it("parses sampleLayout when attributeLayout and staticLayout are empty", () => {
        const sampleLayout = JSON.stringify({ title: "Sample" });
        expect(parseLayout(undefined, undefined, sampleLayout)).toEqual({ title: "Sample" });
    });

    it("parses attributeLayout and ignores sampleLayout if attributeLayout is present", () => {
        const attributeLayout = JSON.stringify({ title: "Attr" });
        const sampleLayout = JSON.stringify({ title: "Sample" });
        expect(parseLayout(undefined, attributeLayout, sampleLayout)).toEqual({ title: "Attr" });
    });
});

describe("parseConfig", () => {
    it("returns empty object when configOptions is empty", () => {
        expect(parseConfig()).toEqual({});
    });

    it("parses configOptions", () => {
        const configOptions = JSON.stringify({ responsive: true });
        expect(parseConfig(configOptions)).toEqual({ responsive: true });
    });
});
