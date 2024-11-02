import { ChartWidget } from "@mendix/shared-charts/main";
import { EditableValueBuilder, ListAttributeValueBuilder, listExp, list } from "@mendix/widget-plugin-test-utils";
import Big from "big.js";
import { mount, ReactWrapper } from "enzyme";
import { createElement } from "react";
import { SeriesType } from "../../typings/BarChartProps";
import { BarChart } from "../BarChart";

jest.mock("react-plotly.js", () => jest.fn(() => null));

describe("The BarChart widget", () => {
    function renderBarChart(configs: Array<Partial<SeriesType>>): ReactWrapper {
        return mount(
            <BarChart
                name="bar-chart-test"
                class="bar-chart-class"
                barmode="group"
                series={configs.map(setupBasicSeries)}
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
        const barChart = renderBarChart([{}]);
        const data = barChart.find(ChartWidget).prop("data");
        expect(data).toHaveLength(1);
        expect(data[0]).toHaveProperty("type", "bar");
    });

    it("sets the bar color on the data series based on the barColor value", () => {
        const barChart = renderBarChart([{ staticBarColor: listExp(() => "red") }, { staticBarColor: undefined }]);
        const data = barChart.find(ChartWidget).prop("data");
        expect(data).toHaveLength(2);
        expect(data[0]).toHaveProperty("marker.color", "red");
        expect(data[1]).toHaveProperty("marker.color", undefined);
    });

    it("sets the appropriate transforms on the data series based on the aggregation type", () => {
        const barChart = renderBarChart([{ aggregationType: "none" }, { aggregationType: "avg" }]);
        const data = barChart.find(ChartWidget).prop("data");
        expect(data).toHaveLength(2);
        expect(data[0]).toHaveProperty("transforms", []);
        expect(data[1]).toHaveProperty("transforms", [
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
        ]);
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
