import { parseConfig, parseData, parseLayout } from "../utils/utils";

describe("parseData", () => {
    it("returns empty array when all inputs are empty", () => {
        expect(parseData()).toEqual([]);
    });

    it("parses staticData only", () => {
        const staticData = JSON.stringify([{ x: [1], y: [2] }]);
        expect(parseData(staticData)).toEqual([{ x: [1], y: [2] }]);
    });

    it("parses sampleData when attributeData and staticData are empty", () => {
        const sampleData = JSON.stringify([{ x: [3], y: [4] }]);
        expect(parseData(undefined, undefined, sampleData)).toEqual([{ x: [3], y: [4] }]);
    });

    it("parses attributeData and ignores sampleData if attributeData is present", () => {
        const attributeData = JSON.stringify([{ x: [5], y: [6] }]);
        const sampleData = JSON.stringify([{ x: [7], y: [8] }]);
        expect(parseData(undefined, attributeData, sampleData)).toEqual([{ x: [5], y: [6] }]);
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
