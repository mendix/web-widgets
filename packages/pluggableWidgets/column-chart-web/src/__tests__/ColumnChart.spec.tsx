import { ChartWidget } from "@mendix/shared-charts/main";
import { EditableValueBuilder, ListAttributeValueBuilder, list, listExp } from "@mendix/widget-plugin-test-utils";
import Big from "big.js";
import { render, RenderResult } from "@testing-library/react";
import { createElement } from "react";
import { ColumnChartContainerProps, SeriesType } from "../../typings/ColumnChartProps";
import { ColumnChart } from "../ColumnChart";

jest.mock("@mendix/shared-charts/main", () => {
    const actualModule = jest.requireActual("@mendix/shared-charts/main");
    return {
        ...actualModule,
        ChartWidget: jest.fn(() => null)
    };
});

jest.mock("react-plotly.js", () => jest.fn(() => null));

describe("The ColumnChart widget", () => {
    function renderColumnChart(
        configs: Array<Partial<SeriesType>>,
        chartProps?: Partial<ColumnChartContainerProps>
    ): RenderResult {
        return render(
            <ColumnChart
                name="column-chart-test"
                class="column-chart-class"
                barmode="group"
                series={configs.map(setupBasicSeries)}
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
        renderColumnChart([{}]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                seriesOptions: expect.objectContaining({
                    type: "bar",
                    orientation: "v"
                })
            }),
            expect.anything()
        );
    });

    it("sets the bar color on the data series based on the barColor value", () => {
        renderColumnChart([{ staticBarColor: listExp(() => "red") }, { staticBarColor: undefined }]);

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        const data = lastCallProps.data;

        expect(data).toHaveLength(2);
        expect(data[0].marker.color).toBe("red");
        expect(data[1].marker.color).toBeUndefined();
    });

    it("aggregates data based on the aggregation type", () => {
        renderColumnChart([{ aggregationType: "none" }, { aggregationType: "avg" }]);

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        const data = lastCallProps.data;

        expect(data).toHaveLength(2);

        // Check that each data series has x and y arrays
        expect(data[0]).toHaveProperty("x");
        expect(data[0]).toHaveProperty("y");
        expect(data[1]).toHaveProperty("x");
        expect(data[1]).toHaveProperty("y");

        // Verify the arrays contain numbers
        expect(Array.isArray(data[0].x)).toBe(true);
        expect(Array.isArray(data[0].y)).toBe(true);
        expect(Array.isArray(data[1].x)).toBe(true);
        expect(Array.isArray(data[1].y)).toBe(true);
    });

    it("sets the appropriate barmode on the layout based on the barmode type", () => {
        renderColumnChart([], { barmode: "stack" });

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                layoutOptions: expect.objectContaining({
                    barmode: "stack"
                })
            }),
            expect.anything()
        );
    });
});

function setupBasicSeries(overwriteConfig: Partial<SeriesType>): SeriesType {
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
        staticBarColor: overwriteConfig.staticBarColor ?? undefined,
        staticDataSource: list(2),
        staticXAttribute: xAttribute,
        staticYAttribute: yAttribute
    };
}
