import { renderHook } from "@testing-library/react";
import { usePlotChartDataSeries, PlotDataSeries, SeriesMapper } from "../usePlotChartDataSeries";
import {
    ListValueBuilder,
    ListAttributeValueBuilder,
    EditableValueBuilder,
    objectItems
} from "@mendix/pluggable-test-utils";
import { ListAttributeValue, ListValue, ListExpressionValue } from "mendix";
import { dynamicValue } from "@mendix/pluggable-widgets-commons";

function axisAttr(): ListAttributeValue<string> {
    const attr = new ListAttributeValueBuilder<string>().withType("String").build();
    attr.get = jest.fn().mockReturnValue(new EditableValueBuilder().withValue("0").build());
    return attr;
}

function groupByAttr(groups: string[]): ListAttributeValue<string> {
    let index = 0;
    const attr = new ListAttributeValueBuilder<string>().withType("String").build();
    attr.get = jest.fn(() => {
        const value = new EditableValueBuilder<string>().withValue(groups[index]).build();
        index = index + 1 === groups.length ? 0 : index + 1;
        return value;
    });
    return attr;
}

function list(n: number): ListValue {
    return ListValueBuilder().withItems(objectItems(n));
}

function singleData(): PlotDataSeries {
    return {
        dataSet: "static",
        staticDataSource: list(8),
        staticXAttribute: axisAttr(),
        staticYAttribute: axisAttr(),
        customSeriesOptions: undefined
    };
}

function multiData(params = { n: 12, groups: ["alpha", "beta"] }): PlotDataSeries {
    const x = { get: () => dynamicValue(Math.random().toString()) } as unknown as ListExpressionValue<string>;
    return {
        dataSet: "dynamic",
        dynamicDataSource: list(params.n),
        dynamicXAttribute: axisAttr(),
        dynamicYAttribute: axisAttr(),
        groupByAttribute: groupByAttr(params.groups),
        dynamicName: x,
        customSeriesOptions: undefined
    };
}

describe("with grouping off (single series)", () => {
    describe("with no ActionValue", () => {
        it("return props without onClick handler", () => {
            const set1 = singleData();
            const set2 = singleData();
            const { result } = renderHook(
                (props: { series: PlotDataSeries[]; mapFn: SeriesMapper<PlotDataSeries> }) =>
                    usePlotChartDataSeries(props.series, props.mapFn),
                {
                    initialProps: { series: [set1, set2], mapFn: _ => ({}) }
                }
            );
            const [data1, data2] = result.current ?? [];
            expect(data1.onClick).toBeUndefined();
            expect(data2.onClick).toBeUndefined();
        });
    });
    describe("with ActionValue", () => {
        it("should create onClick prop for each data point", () => {
            const set1 = singleData();
            const set2 = singleData();
            const { result } = renderHook(
                (props: { series: PlotDataSeries[]; mapFn: SeriesMapper<PlotDataSeries> }) =>
                    usePlotChartDataSeries(props.series, props.mapFn),
                {
                    initialProps: { series: [set1, set2], mapFn: _ => ({}) }
                }
            );
            const [data1, data2] = result.current ?? [];
            expect(data1.onClick).toBeInstanceOf(Function);
            expect(data2.onClick).toBeInstanceOf(Function);
        });
    });
});

describe("with grouping on (multiple series)", () => {
    describe("with no ActionValue", () => {
        it("return props without onClick handler", () => {
            const set1 = multiData();
            const set2 = singleData();
            const set3 = multiData({ n: 4, groups: ["left", "right"] });
            const { result } = renderHook(
                (props: { series: PlotDataSeries[]; mapFn: SeriesMapper<PlotDataSeries> }) =>
                    usePlotChartDataSeries(props.series, props.mapFn),
                {
                    initialProps: { series: [set1, set2, set3], mapFn: _ => ({}) }
                }
            );

            expect(result.current).toHaveLength(5);

            for (const data of result.current ?? []) {
                expect(data.onClick).toBeUndefined();
            }
        });
    });
    describe("with ActionValue", () => {
        it("should create onClick prop for each data point", () => {
            expect(true).toBeFalsy();
        });
    });
});
