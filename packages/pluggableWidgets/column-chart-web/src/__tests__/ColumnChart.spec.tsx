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
import { createElement } from "react";
import { render, RenderResult } from "@testing-library/react";
import { ColumnChartContainerProps, SeriesType } from "../../typings/ColumnChartProps";
import { ColumnChart } from "../ColumnChart";

jest.mock("react-plotly.js", () => jest.fn(() => null));

describe("The ColumnChart widget", () => {
    function renderColumnChart(
        configs: Array<Partial<SeriesType>> = [{}],
        chartProps?: Partial<ColumnChartContainerProps>
    ): RenderResult {
        return render(
            <ColumnChart
                name="column-chart-test"
                class="column-chart-class"
                barmode="group"
                series={configs.map(setupBasicColumnSeries)}
                showLegend={false}
                widthUnit="percentage"
                width={0}
                heightUnit="pixels"
                height={0}
                gridLines="none"
                customLayout=""
                customConfigurations=""
                enableThemeConfig={false}
                advancedOptions={false}
                showPlaygroundSlot={false}
                {...chartProps}
            />
        );
    }

    it("visualizes data as a bar chart", () => {
        renderColumnChart();

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                seriesOptions: expect.objectContaining({ type: "bar", orientation: "v" })
            }),
            {}
        );
    });

    it("sets the bar color on the data series based on the barColor value", () => {
        renderColumnChart([{ staticBarColor: listExpression(() => "red") }, { staticBarColor: undefined }]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ marker: { color: "red" } }),
                    expect.objectContaining({ marker: { color: undefined } })
                ])
            }),
            {}
        );
    });

    it("sets the appropriate transforms on the data series based on the aggregation type", () => {
        renderColumnChart([{ aggregationType: "none" }, { aggregationType: "avg" }]);
        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ transforms: [] }),
                    expect.objectContaining({
                        transforms: [
                            {
                                type: "aggregate",
                                groups: ["1", "2"],
                                aggregations: [
                                    {
                                        target: "y",
                                        enabled: true,
                                        func: "avg"
                                    }
                                ]
                            }
                        ]
                    })
                ])
            }),
            {}
        );
    });

    it("sets the appropriate barmode on the layout based on the barmode type", () => {
        renderColumnChart([], { barmode: "stack" });
        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                layoutOptions: expect.objectContaining({ barmode: "stack" })
            }),
            {}
        );
    });
});

function setupBasicColumnSeries(overwriteConfig: Partial<SeriesType>): SeriesType {
    const basicSeries = setupBasicSeries(overwriteConfig) as SeriesType;

    return {
        ...basicSeries,
        staticBarColor: overwriteConfig.staticBarColor ?? undefined
    };
}
