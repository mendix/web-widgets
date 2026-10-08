import {
    CustomLayoutProps,
    defaultConfigs,
    getCustomLayoutOptions,
    getModelerConfigOptions,
    getModelerLayoutOptions,
    getModelerSeriesOptions
} from "../configs";

const props: CustomLayoutProps = {
    showLegend: true,
    xAxisLabel: { text: "X-Axis" },
    yAxisLabel: { text: "Y-Axis" },
    gridLinesMode: "both"
};

describe("getCustomLayoutOptions", () => {
    it("passes axis titles through as { text } without extra nesting", () => {
        const layout = getCustomLayoutOptions(props);

        expect(layout.showlegend).toBe(true);
        expect(layout.xaxis?.title).toEqual({ text: "X-Axis" });
        expect(layout.yaxis?.title).toEqual({ text: "Y-Axis" });
    });

    it("leaves the axis title undefined when no label is given", () => {
        const layout = getCustomLayoutOptions({ ...props, xAxisLabel: undefined, yAxisLabel: undefined });

        expect(layout.xaxis?.title).toBeUndefined();
        expect(layout.yaxis?.title).toBeUndefined();
    });

    it.each([
        ["both", true, true],
        ["vertical", true, false],
        ["horizontal", false, true],
        ["none", false, false]
    ] as const)("maps gridLinesMode %s to showgrid x=%s y=%s", (gridLinesMode, x, y) => {
        const layout = getCustomLayoutOptions({ ...props, gridLinesMode });

        expect(layout.xaxis?.showgrid).toBe(x);
        expect(layout.yaxis?.showgrid).toBe(y);
    });
});

describe("modeler options merging", () => {
    it("keeps axis titles intact and layers defaults, custom layout and overrides", () => {
        const layout = getModelerLayoutOptions(getCustomLayoutOptions(props), {
            xaxis: { gridcolor: "#d7d7d7" },
            margin: { t: 10 }
        });

        expect(layout.xaxis).toEqual({ title: { text: "X-Axis" }, showgrid: true, gridcolor: "#d7d7d7" });
        expect(layout.yaxis).toEqual({ title: { text: "Y-Axis" }, showgrid: true });
        expect(layout.margin).toEqual({ ...defaultConfigs.layout.margin, t: 10 });
        expect(layout.font).toEqual(defaultConfigs.layout.font);
    });

    it("applies defaults for config and series with custom values winning", () => {
        expect(getModelerConfigOptions({ displayModeBar: true })).toEqual({
            ...defaultConfigs.configuration,
            displayModeBar: true
        });
        expect(getModelerSeriesOptions({ hoverinfo: "text" })).toEqual({
            ...defaultConfigs.series,
            hoverinfo: "text"
        });
    });
});
