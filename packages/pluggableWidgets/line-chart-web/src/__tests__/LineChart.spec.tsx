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

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const firstCallProps = mockCalls[mockCalls.length - 1][0];
        expect(firstCallProps.data).toHaveLength(1);
        expect(firstCallProps.data[0].type).toEqual("scatter");
    });

    it("sets the mode on the data series based on the lineStyle value", () => {
        renderLineChart([{ lineStyle: "lineWithMarkers" }, { lineStyle: "line" }]);

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const firstCallProps = mockCalls[mockCalls.length - 1][0];
        expect(firstCallProps.data).toHaveLength(2);
        expect(firstCallProps.data[0].mode).toEqual("lines+markers");
        expect(firstCallProps.data[1].mode).toEqual("lines");
    });

    it("sets the line shape on the data series based on the interpolation value", () => {
        renderLineChart([{ interpolation: "linear" }, { interpolation: "spline" }]);

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const firstCallProps = mockCalls[mockCalls.length - 1][0];
        expect(firstCallProps.data).toHaveLength(2);
        expect(firstCallProps.data[0].line.shape).toEqual("linear");
        expect(firstCallProps.data[1].line.shape).toEqual("spline");
    });

    it("sets the line color on the data series based on the lineColor value", () => {
        renderLineChart([{ staticLineColor: listExp(() => "red") }, { staticLineColor: undefined }]);

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const firstCallProps = mockCalls[mockCalls.length - 1][0];
        expect(firstCallProps.data).toHaveLength(2);
        expect(firstCallProps.data[0].line.color).toEqual("red");
        expect(firstCallProps.data[1].line.color).toBeUndefined();
    });

    it("sets the marker color on the data series based on the markerColor value", () => {
        renderLineChart([{ staticMarkerColor: undefined }, { staticMarkerColor: listExp(() => "blue") }]);

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const firstCallProps = mockCalls[mockCalls.length - 1][0];
        expect(firstCallProps.data).toHaveLength(2);
        expect(firstCallProps.data[0].marker.color).toBeUndefined();
        expect(firstCallProps.data[1].marker.color).toEqual("blue");
    });

    it("aggregates data based on the aggregation type", () => {
        renderLineChart([{ aggregationType: "none" }, { aggregationType: "avg" }]);

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const firstCallProps = mockCalls[mockCalls.length - 1][0];
        expect(firstCallProps.data).toHaveLength(2);
        expect(firstCallProps.data[0].x).toHaveLength(2);
        expect(firstCallProps.data[0].y).toHaveLength(2);
        expect(firstCallProps.data[0].x).toEqual([1, 2]);
        expect(firstCallProps.data[0].y).toEqual([3, 6]);
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
