import { toPlotlyData } from "../toPlotlyData";

describe("toPlotlyData", () => {
    it("maps stored records to Plotly traces without reshaping them", () => {
        const stored = [
            { type: "bar", x: [1, 2], y: [3, 4] },
            { type: "scatter", x: [5], y: [6] }
        ];

        expect(toPlotlyData(stored)).toEqual(stored);
    });

    it("returns an empty array for empty data", () => {
        expect(toPlotlyData([])).toEqual([]);
    });
});
