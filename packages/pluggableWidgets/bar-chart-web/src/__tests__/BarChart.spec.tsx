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
import { SeriesType } from "../../typings/BarChartProps";
import { BarChart } from "../BarChart";

jest.mock("react-plotly.js", () => jest.fn(() => null));

describe("The BarChart widget", () => {
    function renderBarChart(configs: Array<Partial<SeriesType>> = [{}]): RenderResult {
        return render(
            <BarChart
                name="bar-chart-test"
                class="bar-chart-class"
                barmode="group"
                series={configs.map(setupBasicBarSeries)}
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

    it("visualizes data as a bar chart", () => {
        renderBarChart();

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([expect.objectContaining({ type: "bar" })])
            }),
            {}
        );
    });

    it("sets the bar color on the data series based on the barColor value", () => {
        renderBarChart([{ staticBarColor: listExpression(() => "red") }, { staticBarColor: undefined }]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ marker: expect.objectContaining({ color: "red" }) }),
                    expect.objectContaining({ marker: expect.objectContaining({ color: undefined }) })
                ])
            }),
            {}
        );
    });

    it("sets the appropriate transforms on the data series based on the aggregation type", () => {
        renderBarChart([{ aggregationType: "none" }, { aggregationType: "avg" }]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ transforms: expect.arrayContaining([]) }),
                    expect.objectContaining({
                        transforms: expect.arrayContaining([
                            expect.objectContaining({
                                type: "aggregate",
                                groups: expect.arrayContaining(["1", "2"]),
                                aggregations: expect.arrayContaining([
                                    expect.objectContaining({ target: "y", enabled: true, func: "avg" })
                                ])
                            })
                        ])
                    })
                ])
            }),
            {}
        );
    });
});

function setupBasicBarSeries(overwriteConfig: Partial<SeriesType>): SeriesType {
    const basicSeries = setupBasicSeries(overwriteConfig) as SeriesType;

    return {
        ...basicSeries,
        staticBarColor: overwriteConfig.staticBarColor ?? undefined
    };
}
