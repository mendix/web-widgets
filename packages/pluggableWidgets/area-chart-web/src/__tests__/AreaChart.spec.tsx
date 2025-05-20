jest.mock("@mendix/shared-charts/main", () => {
    const actualModule = jest.requireActual("@mendix/shared-charts/main");
    return {
        ...actualModule,
        ChartWidget: jest.fn(() => null)
    };
});

import { ChartWidget, setupBasicSeries } from "@mendix/shared-charts/main";
import { listExpression } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import { createElement } from "react";
import { SeriesType } from "../../typings/AreaChartProps";
import { AreaChart } from "../AreaChart";

jest.mock("react-plotly.js", () => jest.fn(() => null));

describe("The AreaChart widget", () => {
    function renderAreaChart(configs: Array<Partial<SeriesType>>): RenderResult {
        return render(
            <AreaChart
                name="line-chart-test"
                class="line-chart-class"
                series={configs.map(setupBasicAreaSeries)}
                showLegend={false}
                widthUnit="percentage"
                width={0}
                heightUnit="pixels"
                height={0}
                gridLines="none"
                customLayout=""
                customConfigurations=""
                enableThemeConfig={false}
                enableAdvancedOptions={false}
                showPlaygroundSlot={false}
            />
        );
    }

    it("visualizes data as a area chart", () => {
        renderAreaChart([{}]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        type: "scatter",
                        fill: "tonexty"
                    })
                ])
            }),
            {}
        );
    });

    it("sets the mode on the data series based on the lineStyle value", () => {
        renderAreaChart([{ lineStyle: "lineWithMarkers" }, { lineStyle: "line" }]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ mode: "lines+markers" }),
                    expect.objectContaining({ mode: "lines" })
                ])
            }),
            {}
        );
    });

    it("sets the line shape on the data series based on the interpolation value", () => {
        renderAreaChart([{ interpolation: "linear" }, { interpolation: "spline" }]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ line: expect.objectContaining({ shape: "linear" }) }),
                    expect.objectContaining({ line: expect.objectContaining({ shape: "spline" }) })
                ])
            }),
            {}
        );
    });

    it("sets the line color on the data series based on the lineColor value", () => {
        renderAreaChart([{ staticLineColor: listExpression(() => "red") }, { staticLineColor: undefined }]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ line: expect.objectContaining({ color: "red" }) }),
                    expect.objectContaining({ line: expect.objectContaining({ color: undefined }) })
                ])
            }),
            {}
        );
    });

    it("sets the marker color on the data series based on the markerColor value", () => {
        renderAreaChart([{ staticMarkerColor: undefined }, { staticMarkerColor: listExpression(() => "blue") }]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ marker: expect.objectContaining({ color: undefined }) }),
                    expect.objectContaining({ marker: expect.objectContaining({ color: "blue" }) })
                ])
            }),
            {}
        );
    });

    it("sets the area color on the data series based on the fillcolor value", () => {
        renderAreaChart([{ staticFillColor: undefined }, { staticFillColor: listExpression(() => "#393393") }]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ fillcolor: undefined }),
                    expect.objectContaining({ fillcolor: "#393393" })
                ])
            }),
            {}
        );
    });

    it("aggregates data based on the aggregation type", () => {
        renderAreaChart([{ aggregationType: "none" }, { aggregationType: "avg" }]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        x: expect.arrayContaining([expect.any(Number)]),
                        y: expect.arrayContaining([expect.any(Number)])
                    }),
                    expect.objectContaining({
                        x: expect.arrayContaining([expect.any(Number)]),
                        y: expect.arrayContaining([expect.any(Number)])
                    })
                ])
            }),
            {}
        );

        renderAreaChart([{ aggregationType: "none" }, { aggregationType: "avg" }]);
        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps.data).toHaveLength(2);
    });
});

function setupBasicAreaSeries(overwriteConfig: Partial<SeriesType>): SeriesType {
    const basicSeries = setupBasicSeries(overwriteConfig) as SeriesType;

    return {
        ...basicSeries,
        interpolation: overwriteConfig.interpolation ?? "linear",
        lineStyle: overwriteConfig.lineStyle ?? "line",
        staticLineColor: overwriteConfig.staticLineColor ?? undefined,
        staticMarkerColor: overwriteConfig.staticMarkerColor ?? undefined,
        staticFillColor: overwriteConfig.staticFillColor ?? undefined
    };
}
