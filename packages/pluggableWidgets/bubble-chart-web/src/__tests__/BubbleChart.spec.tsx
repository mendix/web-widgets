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
import { LinesType } from "../../typings/BubbleChartProps";
import { BubbleChart } from "../BubbleChart";

jest.mock("react-plotly.js", () => jest.fn(() => null));

describe("The Bubble widget", () => {
    function renderBubbleChart(configs: Array<Partial<LinesType>> = [{}]): RenderResult {
        return render(
            <BubbleChart
                name="bubble-chart-test"
                class="bubble-chart-class"
                lines={configs.map(setupBasicBubbleSeries)}
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

    it("visualizes data as a bubble chart", () => {
        renderBubbleChart();

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([expect.objectContaining({ type: "scatter", mode: "markers" })])
            }),
            {}
        );
    });

    it("sets the marker color on the data series based on the markerColor value", () => {
        renderBubbleChart([{ staticMarkerColor: listExpression(() => "red") }, { staticMarkerColor: undefined }]);

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

    it("aggregates data based on the aggregation type", () => {
        renderBubbleChart([{ aggregationType: "none" }, { aggregationType: "avg" }]);

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

        renderBubbleChart([{ aggregationType: "none" }, { aggregationType: "avg" }]);
        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps.data).toHaveLength(2);
    });
});

function setupBasicBubbleSeries(overwriteConfig: Partial<LinesType>): LinesType {
    const basicSeries = setupBasicSeries(overwriteConfig) as LinesType;

    return {
        ...basicSeries,
        staticMarkerColor: overwriteConfig.staticMarkerColor ?? undefined,
        autosize: true,
        sizeref: 10
    };
}
