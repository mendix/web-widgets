jest.mock("@mendix/shared-charts/main", () => {
    const actualModule = jest.requireActual("@mendix/shared-charts/main");
    return {
        ...actualModule,
        ChartWidget: jest.fn(() => null)
    };
});

import { ChartWidget } from "@mendix/shared-charts/main";
import { EditableValueBuilder, list, ListAttributeValueBuilder, listExp } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import Big from "big.js";
import { createElement } from "react";
import { LinesType } from "../../typings/LineChartProps";
import { LineChart } from "../LineChart";

describe("The LineChart widget", () => {
    function renderLineChart(configs: Array<Partial<LinesType>>): RenderResult {
        return render(
            <LineChart
                name="line-chart-test"
                class="line-chart-class"
                lines={configs.map(setupBasicSeries)}
                showLegend={false}
                enableAdvancedOptions={false}
                widthUnit="percentage"
                width={0}
                heightUnit="pixels"
                height={0}
                gridLines="none"
                customLayout=""
                customConfigurations=""
                enableThemeConfig={false}
                showPlaygroundSlot={false}
            />
        );
    }
    it("visualizes data as a line chart", () => {
        renderLineChart([{}]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        type: "scatter"
                    })
                ])
            }),
            {}
        );
    });

    it("sets the mode on the data series based on the lineStyle value", () => {
        renderLineChart([{ lineStyle: "lineWithMarkers" }, { lineStyle: "line" }]);

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
        renderLineChart([{ interpolation: "linear" }, { interpolation: "spline" }]);

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
        renderLineChart([{ staticLineColor: listExp(() => "red") }, { staticLineColor: undefined }]);

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
        renderLineChart([{ staticMarkerColor: undefined }, { staticMarkerColor: listExp(() => "blue") }]);

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

    it("aggregates data based on the aggregation type", () => {
        renderLineChart([{ aggregationType: "none" }, { aggregationType: "avg" }]);

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

        renderLineChart([{ aggregationType: "none" }, { aggregationType: "avg" }]);
        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps.data).toHaveLength(2);
    });
});

function setupBasicSeries(overwriteConfig: Partial<LinesType>): LinesType {
    const xAttribute = new ListAttributeValueBuilder<Big>().build();
    const getXAttributeMock = jest.fn();
    getXAttributeMock.mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(1)).build());
    getXAttributeMock.mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(2)).build());
    xAttribute.get = getXAttributeMock;

    const yAttribute = new ListAttributeValueBuilder<Big>().build();
    const getYAttributeMock = jest.fn();
    getYAttributeMock.mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(3)).build());
    getYAttributeMock.mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(6)).build());
    yAttribute.get = getYAttributeMock;

    return {
        dataSet: "static",
        customSeriesOptions: overwriteConfig.customSeriesOptions ?? "",
        aggregationType: overwriteConfig.aggregationType ?? "avg",
        interpolation: overwriteConfig.interpolation ?? "linear",
        lineStyle: overwriteConfig.lineStyle ?? "line",
        staticLineColor: overwriteConfig.staticLineColor ?? undefined,
        staticMarkerColor: overwriteConfig.staticMarkerColor ?? undefined,
        staticDataSource: list(2),
        staticXAttribute: xAttribute,
        staticYAttribute: yAttribute
    };
}
