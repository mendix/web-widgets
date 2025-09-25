jest.mock("@mendix/shared-charts/main", () => {
    const actualModule = jest.requireActual("@mendix/shared-charts/main");
    return {
        ...actualModule,
        ChartWidget: jest.fn(() => null)
    };
});

import { ChartWidget } from "@mendix/shared-charts/main";
import {
    dynamic,
    EditableValueBuilder,
    list,
    ListAttributeValueBuilder,
    listExp
} from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import Big from "big.js";
import { PieChartContainerProps } from "../../typings/PieChartProps";
import { PieChart } from "../PieChart";

describe("The PieChart widget", () => {
    function renderPieChart(props: Partial<PieChartContainerProps>): RenderResult {
        return render(
            <PieChart
                name="line-chart-test"
                class="line-chart-class"
                holeRadius={0}
                showLegend={false}
                enableAdvancedOptions={false}
                widthUnit="percentage"
                width={0}
                heightUnit="pixels"
                height={0}
                customLayout=""
                customConfigurations=""
                customSeriesOptions=""
                seriesSortOrder="asc"
                seriesDataSource={list(2)}
                seriesName={listExp(() => "name")}
                seriesValueAttribute={new ListAttributeValueBuilder<Big>().build()}
                enableThemeConfig={false}
                showPlaygroundSlot={false}
                {...setupBasicAttributes()}
                {...props}
            />
        );
    }

    it("visualizes data as a pie chart", () => {
        renderPieChart({});

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps.seriesOptions.type).toEqual("pie");
    });

    it("sets the hole prop on the data series based on the chartFormat value", () => {
        renderPieChart({ holeRadius: 40 });

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps.data).toHaveLength(1);
        expect(lastCallProps.data[0].hole).toEqual(0.4);
    });

    it("sets proper marker color on the data series based on seriesColorAttribute", () => {
        renderPieChart({});

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps.data).toHaveLength(1);
        expect(lastCallProps.data[0].marker.colors).toEqual(["red", "blue"]);
    });

    it("sets proper label values on the data series based on seriesName", () => {
        renderPieChart({});

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps.data).toHaveLength(1);
        expect(lastCallProps.data[0].labels).toEqual(["first series", "second series"]);
    });

    it("sets proper values on the data series based on seriesValueAttribute", () => {
        renderPieChart({});

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps.data).toHaveLength(1);
        expect(lastCallProps.data[0].values).toEqual([1, 2]);
    });

    describe("sorts the relevant properties in the data series based on seriesSortAttribute", () => {
        it("in ascending order", () => {
            const seriesSortAttribute = new ListAttributeValueBuilder().build();
            seriesSortAttribute.get = jest
                .fn()
                .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(20)).build())
                .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(15)).build())
                .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(20)).build())
                .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(15)).build())
                .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(20)).build())
                .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(15)).build());

            renderPieChart({ seriesSortAttribute });

            const mockCalls = (ChartWidget as jest.Mock).mock.calls;
            const lastCallProps = mockCalls[mockCalls.length - 1][0];
            expect(lastCallProps.data).toHaveLength(1);
            expect(lastCallProps.data[0]).toHaveProperty("values", [2, 1]);
            expect(lastCallProps.data[0]).toHaveProperty("labels", ["second series", "first series"]);
            expect(lastCallProps.data[0]).toHaveProperty("marker.colors", ["blue", "red"]);
        });

        it("in descending order", () => {
            const seriesSortAttribute = new ListAttributeValueBuilder().build();
            seriesSortAttribute.get = jest
                .fn()
                .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(20)).build())
                .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(15)).build())
                .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(20)).build())
                .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(15)).build())
                .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(20)).build())
                .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(15)).build());

            renderPieChart({ seriesSortAttribute, seriesSortOrder: "desc" });

            const mockCalls = (ChartWidget as jest.Mock).mock.calls;
            const lastCallProps = mockCalls[mockCalls.length - 1][0];
            expect(lastCallProps.data).toHaveLength(1);
            expect(lastCallProps.data[0]).toHaveProperty("values", [1, 2]);
            expect(lastCallProps.data[0]).toHaveProperty("labels", ["first series", "second series"]);
            expect(lastCallProps.data[0]).toHaveProperty("marker.colors", ["red", "blue"]);
        });
    });
});

function setupBasicAttributes(): Partial<PieChartContainerProps> {
    const seriesName = listExp(() => "name");
    seriesName.get = jest
        .fn()
        .mockReturnValueOnce(dynamic("first series"))
        .mockReturnValueOnce(dynamic("second series"));

    const seriesDataSource = list(2);

    const seriesValueAttribute = new ListAttributeValueBuilder<Big>().build();
    seriesValueAttribute.get = jest
        .fn()
        .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(1)).build())
        .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(2)).build());

    const seriesColorAttribute = listExp(() => "name");
    seriesColorAttribute.get = jest.fn().mockReturnValueOnce(dynamic("red")).mockReturnValueOnce(dynamic("blue"));

    const seriesSortAttribute = new ListAttributeValueBuilder().build();
    seriesSortAttribute.get = jest
        .fn()
        .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(15)).build())
        .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(20)).build())
        .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(15)).build())
        .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(20)).build())
        .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(15)).build())
        .mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(20)).build());

    return {
        seriesColorAttribute,
        seriesDataSource,
        seriesName,
        seriesValueAttribute,
        seriesSortAttribute
    };
}
