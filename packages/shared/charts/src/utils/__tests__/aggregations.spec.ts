import { aggregateDataPoints, AggregationType } from "../aggregations";
import { PlotChartDataPoints } from "../../hooks/usePlotChartDataSeries";

describe("aggregateDataPoints", () => {
    const createMockDataPoints = (
        x: Array<string | number | Date | null>,
        y: Array<number | null>,
        hovertext?: string[]
    ): PlotChartDataPoints => ({
        x,
        y,
        hovertext,
        hoverinfo: hovertext ? "text" : "none",
        dataSourceItems: []
    });

    describe("when aggregationType is 'none'", () => {
        it("should return the original data points unchanged", () => {
            const points = createMockDataPoints(["A", "B", "C"], [1, 2, 3], ["hover1", "hover2", "hover3"]);
            const result = aggregateDataPoints("none", points);
            expect(result).toBe(points);
        });
    });

    describe("when aggregating data points", () => {
        describe("with string x values", () => {
            it("should aggregate points with the same x value using sum", () => {
                const points = createMockDataPoints(
                    ["A", "B", "A", "C", "B"],
                    [10, 20, 15, 30, 25],
                    ["hover1", "hover2", "hover3", "hover4", "hover5"]
                );
                const result = aggregateDataPoints("sum", points);

                expect(result.x).toEqual(["A", "B", "C"]);
                expect(result.y).toEqual([25, 45, 30]);
                expect(result.hovertext).toEqual(["25", "45", "hover4"]);
            });

            it("should preserve original hover text for single values", () => {
                const points = createMockDataPoints(
                    ["A", "B", "C"],
                    [10, 20, 30],
                    ["custom hover A", "custom hover B", "custom hover C"]
                );
                const result = aggregateDataPoints("avg", points);

                expect(result.x).toEqual(["A", "B", "C"]);
                expect(result.y).toEqual([10, 20, 30]);
                expect(result.hovertext).toEqual(["custom hover A", "custom hover B", "custom hover C"]);
            });
        });

        describe("with number x values", () => {
            it("should convert numbers to strings for grouping", () => {
                const points = createMockDataPoints([1, 2, 1, 3], [10, 20, 15, 30]);
                const result = aggregateDataPoints("sum", points);

                expect(result.x).toEqual(["1", "2", "3"]);
                expect(result.y).toEqual([25, 20, 30]);
            });
        });

        describe("with Date x values", () => {
            it("should convert dates to ISO strings for grouping", () => {
                const date1 = new Date("2023-01-01");
                const date2 = new Date("2023-01-02");
                const points = createMockDataPoints([date1, date2, date1], [10, 20, 15]);
                const result = aggregateDataPoints("sum", points);

                expect(result.x).toEqual([date1.toISOString(), date2.toISOString()]);
                expect(result.y).toEqual([25, 20]);
            });
        });

        describe("with null values", () => {
            it("should handle null x values by grouping them together", () => {
                const points = createMockDataPoints([null, "A", null, "B"], [10, 20, 15, 30]);
                const result = aggregateDataPoints("sum", points);

                expect(result.x).toEqual(["", "A", "B"]);
                expect(result.y).toEqual([25, 20, 30]);
            });

            it("should skip null y values", () => {
                const points = createMockDataPoints(["A", "A", "B"], [10, null, 20]);
                const result = aggregateDataPoints("sum", points);

                expect(result.x).toEqual(["A", "B"]);
                expect(result.y).toEqual([10, 20]);
            });
        });

        describe("without hover text", () => {
            it("should generate aggregation hovertext if items are grouped, even if original hovertext was undefined", () => {
                const points = createMockDataPoints(["A", "A", "B"], [10, 15, 20]); // No hovertext for B initially
                const result = aggregateDataPoints("sum", points);

                expect(result.x).toEqual(["A", "B"]);
                expect(result.y).toEqual([25, 20]);
                // For A (grouped): "SUM: 25 (2 values)"
                // For B (single, no original hovertext): undefined
                expect(result.hovertext).toEqual(["25", undefined]);
                expect(result.hoverinfo).toBe("text"); // Because "SUM: 25 (2 values)" is present
            });

            it("should be undefined and hoverinfo 'none' if no original or generated hovertext for single points", () => {
                const points = createMockDataPoints(["A", "B", "C"], [10, 20, 30]); // No hovertext provided
                // 'sum' on single, distinct points: yVals.length will be 1 for each.
                // hoverTexts[0] will be undefined for each as original hovertext was undefined.
                const result = aggregateDataPoints("sum", points);

                expect(result.x).toEqual(["A", "B", "C"]);
                expect(result.y).toEqual([10, 20, 30]);
                expect(result.hovertext).toBeUndefined(); // All points are single, no original hovertext
                expect(result.hoverinfo).toBe("none");
            });
        });
    });

    describe("aggregation types", () => {
        const testData = [5, 10, 15, 20];
        const points = createMockDataPoints(["A", "A", "A", "A"], testData);

        it.each([
            ["count", 4],
            ["sum", 50],
            ["avg", 12.5],
            ["min", 5],
            ["max", 20],
            ["first", 5],
            ["last", 20]
        ] as Array<[AggregationType, number]>)("should correctly compute aggregation", (aggregationType, expected) => {
            const result = aggregateDataPoints(aggregationType, points);
            expect(result.y).toEqual([expected]);
            expect(result.hovertext).toEqual([expected.toLocaleString()]);
        });

        describe("median aggregation", () => {
            it("should compute median for odd number of values", () => {
                const oddPoints = createMockDataPoints(["A", "A", "A"], [1, 3, 5]);
                const result = aggregateDataPoints("median", oddPoints);
                expect(result.y).toEqual([3]);
            });

            it("should compute median for even number of values", () => {
                const evenPoints = createMockDataPoints(["A", "A", "A", "A"], [1, 2, 3, 4]);
                const result = aggregateDataPoints("median", evenPoints);
                expect(result.y).toEqual([2.5]);
            });
        });

        describe("mode aggregation", () => {
            it("should find the most frequent value", () => {
                const modePoints = createMockDataPoints(["A", "A", "A", "A", "A"], [1, 2, 2, 3, 2]);
                const result = aggregateDataPoints("mode", modePoints);
                expect(result.y).toEqual([2]);
            });

            it("should return first value when all values have same frequency", () => {
                const modePoints = createMockDataPoints(["A", "A", "A"], [1, 2, 3]);
                const result = aggregateDataPoints("mode", modePoints);
                expect(result.y).toEqual([1]);
            });
        });
    });

    describe("edge cases", () => {
        it("should handle empty data", () => {
            const points = createMockDataPoints([], []);
            const result = aggregateDataPoints("sum", points);

            expect(result.x).toEqual([]);
            expect(result.y).toEqual([]);
            expect(result.hovertext).toBeUndefined();
        });

        it("should handle data with all null y values", () => {
            const points = createMockDataPoints(["A", "B"], [null, null]);
            const result = aggregateDataPoints("sum", points);

            expect(result.x).toEqual([]);
            expect(result.y).toEqual([]);
            expect(result.hovertext).toBeUndefined();
        });

        it("should return NaN for empty groups in aggregation functions", () => {
            const points = createMockDataPoints(["A"], []);
            const result = aggregateDataPoints("sum", points);

            expect(result.x).toEqual([]);
            expect(result.y).toEqual([]);
        });

        it("should handle mixed hover text presence", () => {
            const points = createMockDataPoints(["A", "A", "B", "B"], [10, 15, 20, 25]);
            points.hovertext = ["hover1", undefined as any, "hover3", "hover4"];
            const result = aggregateDataPoints("sum", points);

            expect(result.hovertext).toEqual(["25", "45"]);
        });

        it("should preserve other properties and original data for non-aggregated points", () => {
            const basePoints = createMockDataPoints(["A", "B"], [10, 20], ["hoverA", "hoverB"]);
            const pointsWithCustomProp = {
                ...basePoints,
                customProperty: "should be preserved"
            };

            // Using "sum" but on distinct points, so no actual aggregation occurs for yVals > 1
            const result = aggregateDataPoints("sum", pointsWithCustomProp);

            expect((result as any).customProperty).toBe("should be preserved");
            expect(result.x).toEqual(["A", "B"]);
            expect(result.y).toEqual([10, 20]); // Should remain original
            expect(result.hovertext).toEqual(["hoverA", "hoverB"]); // Should remain original
            expect(result.hoverinfo).toBe("text"); // Original hovertext exists
        });
    });

    describe("hover text formatting", () => {
        it("should format hover text with proper capitalization", () => {
            const points = createMockDataPoints(["A", "A"], [10, 15], ["hover1", "hover2"]);
            const result = aggregateDataPoints("avg", points);

            expect(result.hovertext).toEqual(["12.5"]);
        });

        it("should handle decimal values in hover text", () => {
            const points = createMockDataPoints(["A", "A"], [1, 2], ["hover1", "hover2"]);
            const result = aggregateDataPoints("avg", points);

            expect(result.hovertext).toEqual(["1.5"]);
        });

        it("should show count in hover text", () => {
            const points = createMockDataPoints(["A", "A", "A"], [1, 2, 3], ["h1", "h2", "h3"]);
            const result = aggregateDataPoints("sum", points);

            expect(result.hovertext).toEqual(["6"]);
        });
    });
});
