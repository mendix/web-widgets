import { EditorStoreState } from "@mendix/shared-charts/main";
import { ChartProps } from "../components/PlotlyChart";
import { mergeChartProps } from "../utils/utils";

// Mock console.warn to capture warnings
let consoleWarnSpy: jest.SpyInstance;
let consoleMockCalls: string[][];

beforeEach(() => {
    consoleMockCalls = [];
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation((...args: any[]) => {
        consoleMockCalls.push(args.map(arg => String(arg)));
    });
});

afterEach(() => {
    consoleWarnSpy.mockRestore();
});

describe("mergeChartProps utility function", () => {
    describe("JSON parsing failures generate console warnings", () => {
        it("should warn for invalid JSON in editor state data", () => {
            // Arrange
            const chartProps: ChartProps = {
                data: [{ x: [1, 2], y: [3, 4], type: "scatter" }],
                layout: { title: { text: "Test Chart" } },
                config: { displayModeBar: false },
                width: 800,
                height: 600
            };

            const editorState: EditorStoreState = {
                layout: "{}",
                config: "{}",
                data: ["invalid json"]
            };

            // Act
            mergeChartProps(chartProps, editorState);

            // Assert
            expect(consoleMockCalls).toMatchSnapshot();
        });

        it("should warn for multiple invalid JSON entries", () => {
            // Arrange
            const chartProps: ChartProps = {
                data: [
                    { x: [1], y: [2], type: "scatter" },
                    { x: [3], y: [4], type: "bar" }
                ],
                layout: {},
                config: {},
                width: 800,
                height: 600
            };

            const editorState: EditorStoreState = {
                layout: "{}",
                config: "{}",
                data: ["invalid json", "{broken: json}"]
            };

            // Act
            mergeChartProps(chartProps, editorState);

            // Assert
            expect(consoleMockCalls).toMatchSnapshot();
        });

        it("should not warn when editor state has undefined entries", () => {
            // Arrange
            const chartProps: ChartProps = {
                data: [{ x: [1], y: [2], type: "scatter" }],
                layout: {},
                config: {},
                width: 800,
                height: 600
            };

            const editorState: EditorStoreState = {
                layout: "{}",
                config: "{}",
                data: [] // Empty array, so data[0] will be undefined
            };

            // Act
            mergeChartProps(chartProps, editorState);

            // Assert
            expect(consoleMockCalls).toMatchSnapshot();
        });

        it("should not warn for valid JSON", () => {
            // Arrange
            const chartProps: ChartProps = {
                data: [{ x: [1], y: [2], type: "scatter" }],
                layout: {},
                config: {},
                width: 800,
                height: 600
            };

            const editorState: EditorStoreState = {
                layout: "{}",
                config: "{}",
                data: ['{"marker": {"color": "red"}}']
            };

            // Act
            mergeChartProps(chartProps, editorState);

            // Assert
            expect(consoleMockCalls).toMatchSnapshot();
        });

        it("should handle mixed valid and invalid JSON", () => {
            // Arrange
            const chartProps: ChartProps = {
                data: [
                    { x: [1], y: [2], type: "scatter" },
                    { x: [3], y: [4], type: "bar" },
                    { x: [5], y: [6], type: "scatter" as const }
                ],
                layout: {},
                config: {},
                width: 800,
                height: 600
            };

            const editorState: EditorStoreState = {
                layout: "{}",
                config: "{}",
                data: [
                    '{"marker": {"color": "red"}}', // Valid
                    "invalid json", // Invalid
                    '{"marker": {"color": "blue"}}' // Valid
                ]
            };

            // Act
            mergeChartProps(chartProps, editorState);

            // Assert
            expect(consoleMockCalls).toMatchSnapshot();
        });
    });

    describe("Data merging behavior", () => {
        it("should merge valid editor state data with chart props", () => {
            // Arrange
            const chartProps: ChartProps = {
                data: [{ x: [1, 2], y: [3, 4], type: "scatter", name: "original" }],
                layout: { title: { text: "Original Title" } },
                config: { displayModeBar: true },
                width: 800,
                height: 600
            };

            const editorState: EditorStoreState = {
                layout: '{"title": "Modified Title"}',
                config: '{"displayModeBar": false}',
                data: ['{"marker": {"color": "red"}, "name": "modified"}']
            };

            // Act
            const result = mergeChartProps(chartProps, editorState);

            // Assert
            expect(result.data[0]).toEqual({
                x: [1, 2],
                y: [3, 4],
                type: "scatter",
                name: "modified", // Overridden by editor state
                marker: { color: "red" } // Added by editor state
            });
            expect(result.layout.title).toBe("Modified Title");
            expect(result.config.displayModeBar).toBe(false);
        });

        it("should use empty object for invalid JSON entries", () => {
            // Arrange
            const chartProps: ChartProps = {
                data: [{ x: [1], y: [2], type: "scatter", name: "original" }],
                layout: {},
                config: {},
                width: 800,
                height: 600
            };

            const editorState: EditorStoreState = {
                layout: "{}",
                config: "{}",
                data: ["invalid json"]
            };

            // Act
            const result = mergeChartProps(chartProps, editorState);

            // Assert
            expect(result.data[0]).toEqual({
                x: [1],
                y: [2],
                type: "scatter",
                name: "original" // Original properties preserved
            });
        });

        it("should only process traces that exist in chart props", () => {
            // Arrange
            const chartProps: ChartProps = {
                data: [{ x: [1], y: [2], type: "scatter" }], // Only 1 trace
                layout: {},
                config: {},
                width: 800,
                height: 600
            };

            const editorState: EditorStoreState = {
                layout: "{}",
                config: "{}",
                data: [
                    '{"marker": {"color": "red"}}', // Will be processed
                    '{"marker": {"color": "blue"}}', // Will be ignored
                    "invalid json" // Will be ignored
                ]
            };

            // Act
            const result = mergeChartProps(chartProps, editorState);

            // Assert
            expect(result.data).toHaveLength(1); // Only 1 trace in result
            expect(result.data[0]).toEqual({
                x: [1],
                y: [2],
                type: "scatter",
                marker: { color: "red" }
            });
            expect(consoleMockCalls).toMatchSnapshot(); // No warnings for ignored entries
        });

        it("should preserve original trace data when editor state has missing or falsy entries", () => {
            // Arrange
            const chartProps: ChartProps = {
                data: [
                    { x: [1], y: [1], type: "scatter", name: "original1", marker: { color: "blue" } },
                    { x: [2], y: [2], type: "bar", name: "original2" },
                    { x: [3], y: [3], type: "scatter", name: "original3" }
                ],
                layout: {},
                config: {},
                width: 800,
                height: 600
            };

            const editorState: EditorStoreState = {
                layout: "{}",
                config: "{}",
                data: [""] // Only one entry (empty string), so traces 1 and 2 will get undefined
            };

            // Act
            const result = mergeChartProps(chartProps, editorState);

            // Assert - All original trace data should be preserved
            expect(result.data[0]).toEqual({
                x: [1],
                y: [1],
                type: "scatter",
                name: "original1",
                marker: { color: "blue" }
            });
            expect(result.data[1]).toEqual({ x: [2], y: [2], type: "bar", name: "original2" });
            expect(result.data[2]).toEqual({ x: [3], y: [3], type: "scatter", name: "original3" });
            expect(consoleMockCalls).toMatchSnapshot();
        });
    });

    describe("Edge cases", () => {
        it("should handle empty chart props data", () => {
            // Arrange
            const chartProps: ChartProps = {
                data: [], // No traces
                layout: {},
                config: {},
                width: 800,
                height: 600
            };

            const editorState: EditorStoreState = {
                layout: "{}",
                config: "{}",
                data: ["invalid json"] // Will be ignored
            };

            // Act
            const result = mergeChartProps(chartProps, editorState);

            // Assert
            expect(result.data).toHaveLength(0);
            expect(consoleMockCalls).toMatchSnapshot();
        });

        it("should handle null JSON parsing", () => {
            // Arrange
            const chartProps: ChartProps = {
                data: [{ x: [1], y: [2], type: "scatter" }],
                layout: {},
                config: {},
                width: 800,
                height: 600
            };

            const editorState: EditorStoreState = {
                layout: "{}",
                config: "{}",
                data: ["null"] // Valid JSON that parses to null
            };

            // Act
            const result = mergeChartProps(chartProps, editorState);

            // Assert
            expect(result.data[0]).toEqual({
                x: [1],
                y: [2],
                type: "scatter"
                // null gets merged, but doesn't add properties
            });
            expect(consoleMockCalls).toMatchSnapshot();
        });

        it("should handle various malformed JSON types", () => {
            // Arrange
            const chartProps: ChartProps = {
                data: [
                    { x: [1], y: [1], type: "scatter" },
                    { x: [2], y: [2], type: "bar" },
                    { x: [3], y: [3], type: "scatter" as const },
                    { x: [4], y: [4], type: "scatter" }
                ],
                layout: {},
                config: {},
                width: 800,
                height: 600
            };

            const editorState: EditorStoreState = {
                layout: "{}",
                config: "{}",
                data: [
                    '{"valid": "json"}', // Valid
                    "{invalid json}", // Invalid
                    "", // Invalid empty string - treated as falsy, early return
                    "undefined" // Invalid
                ]
            };

            // Act
            mergeChartProps(chartProps, editorState);

            // Assert
            expect(consoleMockCalls).toMatchSnapshot();
        });

        it("should handle falsy values in editor state data without warnings", () => {
            // Arrange
            const chartProps: ChartProps = {
                data: [
                    { x: [1], y: [1], type: "scatter", name: "trace1" },
                    { x: [2], y: [2], type: "bar", name: "trace2" },
                    { x: [3], y: [3], type: "scatter", name: "trace3" }
                ],
                layout: {},
                config: {},
                width: 800,
                height: 600
            };

            const editorState: EditorStoreState = {
                layout: "{}",
                config: "{}",
                data: [
                    "", // Empty string - falsy
                    null as any, // null - falsy
                    undefined as any // undefined - falsy
                ]
            };

            // Act
            const result = mergeChartProps(chartProps, editorState);

            // Assert - No warnings should be generated for falsy values
            expect(consoleMockCalls).toMatchSnapshot();
            // Original traces should be returned unchanged
            expect(result.data[0]).toEqual({ x: [1], y: [1], type: "scatter", name: "trace1" });
            expect(result.data[1]).toEqual({ x: [2], y: [2], type: "bar", name: "trace2" });
            expect(result.data[2]).toEqual({ x: [3], y: [3], type: "scatter", name: "trace3" });
        });
    });
});
