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
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        expect(parseData("invalid json")).toEqual([]);
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
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

    it("concatenates independent traces when both static and dynamic have data arrays", () => {
        const staticData = JSON.stringify([
            {
                type: "scatter",
                mode: "lines+markers+text",
                name: "Sessions",
                x: ["2025-12-01", "2025-12-02", "2025-12-03"],
                y: [10, 15, 13]
            }
        ]);
        const attributeData = JSON.stringify([
            {
                type: "scatter",
                mode: "lines+markers+text",
                name: "Sessions (Source B)",
                x: ["2025-12-01", "2025-12-02", "2025-12-03"],
                y: [8, 12, 11]
            }
        ]);
        const result = parseData(staticData, attributeData);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("Sessions");
        expect(result[1].name).toBe("Sessions (Source B)");
    });

    it("merges template static trace with data-only dynamic trace (template pattern)", () => {
        const staticData = JSON.stringify([
            { type: "bar", name: "Sessions A", marker: { color: "rgb(30, 94, 168)" } },
            { type: "scatter", name: "Sessions B", mode: "lines+markers", marker: { color: "rgb(35, 195, 159)" } }
        ]);
        const attributeData = JSON.stringify([
            { x: ["2025-12-01", "2025-12-02"], y: [10, 15] },
            { x: ["2025-12-01", "2025-12-02"], y: [8, 12] }
        ]);
        const result = parseData(staticData, attributeData);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
            type: "bar",
            name: "Sessions A",
            marker: { color: "rgb(30, 94, 168)" },
            x: ["2025-12-01", "2025-12-02"],
            y: [10, 15]
        });
        expect(result[1]).toEqual({
            type: "scatter",
            name: "Sessions B",
            mode: "lines+markers",
            marker: { color: "rgb(35, 195, 159)" },
            x: ["2025-12-01", "2025-12-02"],
            y: [8, 12]
        });
    });

    it("concatenates when static has more data-carrying traces than dynamic", () => {
        const staticData = JSON.stringify([
            { type: "scatter", x: [1, 2], y: [3, 4] },
            { type: "bar", x: [5, 6], y: [7, 8] }
        ]);
        const attributeData = JSON.stringify([{ type: "scatter", x: [10, 20], y: [30, 40] }]);
        const result = parseData(staticData, attributeData);
        // Index 0: both have data and share keys (x, y) → concatenate (2 traces)
        // Index 1: only static has data → keep as-is (1 trace)
        expect(result).toHaveLength(3);
        expect(result[0]).toEqual({ type: "scatter", x: [1, 2], y: [3, 4] });
        expect(result[1]).toEqual({ type: "scatter", x: [10, 20], y: [30, 40] });
        expect(result[2]).toEqual({ type: "bar", x: [5, 6], y: [7, 8] });
    });

    describe("deep merge behavior", () => {
        it("deeply merges nested marker objects", () => {
            const staticData = JSON.stringify([
                { type: "bar", marker: { color: "red", size: 10, line: { width: 2 } } }
            ]);
            const attributeData = JSON.stringify([{ marker: { symbol: "circle", line: { color: "blue" } } }]);
            expect(parseData(staticData, attributeData)).toEqual([
                {
                    type: "bar",
                    marker: {
                        color: "red",
                        size: 10,
                        symbol: "circle",
                        line: { width: 2, color: "blue" }
                    }
                }
            ]);
        });

        it("deeply merges multiple traces with nested objects", () => {
            const staticData = JSON.stringify([
                { type: "scatter", marker: { color: "red" }, line: { width: 2 } },
                { type: "bar", marker: { size: 10 } }
            ]);
            const attributeData = JSON.stringify([
                { marker: { symbol: "diamond" }, line: { dash: "dot" } },
                { marker: { color: "blue" } }
            ]);
            expect(parseData(staticData, attributeData)).toEqual([
                {
                    type: "scatter",
                    marker: { color: "red", symbol: "diamond" },
                    line: { width: 2, dash: "dot" }
                },
                {
                    type: "bar",
                    marker: { size: 10, color: "blue" }
                }
            ]);
        });

        it("keeps traces separate when both have data arrays", () => {
            const staticData = JSON.stringify([{ x: [1, 2, 3], y: [4, 5, 6] }]);
            const attributeData = JSON.stringify([{ x: [10, 20] }]);
            const result = parseData(staticData, attributeData);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ x: [1, 2, 3], y: [4, 5, 6] });
            expect(result[1]).toEqual({ x: [10, 20] });
        });

        it("deeply merges font and other nested layout-like properties in traces", () => {
            const staticData = JSON.stringify([
                {
                    type: "scatter",
                    textfont: { family: "Arial", size: 12 },
                    hoverlabel: { bgcolor: "white", font: { size: 10 } }
                }
            ]);
            const attributeData = JSON.stringify([
                {
                    textfont: { color: "black" },
                    hoverlabel: { bordercolor: "gray", font: { family: "Helvetica" } }
                }
            ]);
            expect(parseData(staticData, attributeData)).toEqual([
                {
                    type: "scatter",
                    textfont: { family: "Arial", size: 12, color: "black" },
                    hoverlabel: {
                        bgcolor: "white",
                        bordercolor: "gray",
                        font: { size: 10, family: "Helvetica" }
                    }
                }
            ]);
        });
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

    describe("deep merge behavior", () => {
        it("deeply merges nested font objects", () => {
            const staticLayout = JSON.stringify({
                title: { text: "Chart Title", font: { family: "Arial", size: 16 } }
            });
            const attributeLayout = JSON.stringify({
                title: { font: { color: "blue", weight: "bold" } }
            });
            expect(parseLayout(staticLayout, attributeLayout)).toEqual({
                title: {
                    text: "Chart Title",
                    font: { family: "Arial", size: 16, color: "blue", weight: "bold" }
                }
            });
        });

        it("deeply merges xaxis and yaxis configurations", () => {
            const staticLayout = JSON.stringify({
                xaxis: { title: "X Axis", tickfont: { size: 12 }, gridcolor: "lightgray" },
                yaxis: { title: "Y Axis", showgrid: true }
            });
            const attributeLayout = JSON.stringify({
                xaxis: { tickfont: { color: "black" }, range: [0, 100] },
                yaxis: { gridcolor: "gray" }
            });
            expect(parseLayout(staticLayout, attributeLayout)).toEqual({
                xaxis: {
                    title: "X Axis",
                    tickfont: { size: 12, color: "black" },
                    gridcolor: "lightgray",
                    range: [0, 100]
                },
                yaxis: { title: "Y Axis", showgrid: true, gridcolor: "gray" }
            });
        });

        it("deeply merges legend configuration", () => {
            const staticLayout = JSON.stringify({
                legend: { x: 0.5, y: 1, font: { size: 10 }, bgcolor: "white" }
            });
            const attributeLayout = JSON.stringify({
                legend: { orientation: "h", font: { family: "Helvetica" } }
            });
            expect(parseLayout(staticLayout, attributeLayout)).toEqual({
                legend: {
                    x: 0.5,
                    y: 1,
                    font: { size: 10, family: "Helvetica" },
                    bgcolor: "white",
                    orientation: "h"
                }
            });
        });

        it("attribute arrays replace static arrays in layout", () => {
            const staticLayout = JSON.stringify({
                annotations: [{ text: "Note 1" }, { text: "Note 2" }]
            });
            const attributeLayout = JSON.stringify({
                annotations: [{ text: "New Note" }]
            });
            expect(parseLayout(staticLayout, attributeLayout)).toEqual({
                annotations: [{ text: "New Note" }]
            });
        });
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
