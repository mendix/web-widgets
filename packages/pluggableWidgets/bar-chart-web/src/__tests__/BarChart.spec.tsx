jest.mock("@mendix/shared-charts/main", () => {
    const actualModule = jest.requireActual("@mendix/shared-charts/main");
    return {
        ...actualModule,
        ChartWidget: jest.fn(() => null)
    };
});

import { Big } from "big.js";
import { ListAttributeValue } from "mendix";
import { ChartWidget, setupBasicSeries } from "@mendix/shared-charts/main";
import {
    EditableValueBuilder,
    list,
    listExpression,
    ListAttributeValueBuilder
} from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import { SeriesType } from "../../typings/BarChartProps";
import { BarChart } from "../BarChart";

jest.mock("react-plotly.js", () => jest.fn(() => null));

describe("The BarChart widget", () => {
    function renderBarChart(configs: Array<Partial<SeriesType>> = [{}]): RenderResult {
        return render(
            <BarChart
                name="bar-chart-test"
                refreshInterval={0}
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

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps).toEqual(
            expect.objectContaining({
                data: expect.arrayContaining([expect.objectContaining({ type: "bar" })])
            })
        );
    });

    it("sets the bar color on the data series based on the barColor value", () => {
        renderBarChart([{ staticBarColor: listExpression(() => "red") }, { staticBarColor: undefined }]);

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps).toEqual(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ marker: expect.objectContaining({ color: "red" }) }),
                    expect.objectContaining({ marker: expect.objectContaining({ color: undefined }) })
                ])
            })
        );
    });

    it("aggregates data based on the aggregation type", () => {
        renderBarChart([{ aggregationType: "none" }, { aggregationType: "avg" }]);

        let mockCalls = (ChartWidget as jest.Mock).mock.calls;
        let lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps).toEqual(
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
            })
        );

        renderBarChart([{ aggregationType: "none" }, { aggregationType: "avg" }]);
        mockCalls = (ChartWidget as jest.Mock).mock.calls;
        lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps.data).toHaveLength(2);
    });

    it("aggregates the values of bars that share a category", () => {
        const amounts = [10, 14, 6];
        const categories = ["Apples", "Pears", "Apples"];
        const series = setupBasicBarSeries({ aggregationType: "sum" });
        series.staticDataSource = list(3);
        series.staticXAttribute = attributeWithValues(amounts.map(amount => new Big(amount)));
        series.staticYAttribute = attributeWithValues(categories);

        render(
            <BarChart
                name="bar-chart-test"
                refreshInterval={0}
                class="bar-chart-class"
                barmode="group"
                series={[series]}
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

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const [bars] = mockCalls[mockCalls.length - 1][0].data;
        expect(bars.y).toEqual(["Apples", "Pears"]);
        expect(bars.x).toEqual([16, 14]);
    });
});

function setupBasicBarSeries(overwriteConfig: Partial<SeriesType>): SeriesType {
    const basicSeries = setupBasicSeries(overwriteConfig) as SeriesType;

    return {
        ...basicSeries,
        staticBarColor: overwriteConfig.staticBarColor ?? undefined
    };
}

function attributeWithValues<T extends string | Big>(values: T[]): ListAttributeValue<T> {
    const attribute = new ListAttributeValueBuilder<T>().build();
    const get = jest.fn();
    values.forEach(value => get.mockReturnValueOnce(new EditableValueBuilder<T>().withValue(value).build()));
    attribute.get = get;
    return attribute;
}
