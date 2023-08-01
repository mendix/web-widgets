import { renderHook } from "@testing-library/react";
import { usePlotChartDataSeries, PlotDataSeries, SeriesMapper } from "../usePlotChartDataSeries";
import { ListAttributeValueBuilder, EditableValueBuilder, list } from "@mendix/pluggable-test-utils";
import { ListAttributeValue, ListExpressionValue, ListActionValue, ListValue } from "mendix";
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

function singleData(): PlotDataSeries {
    return {
        dataSet: "static",
        staticDataSource: list(8),
        staticXAttribute: axisAttr(),
        staticYAttribute: axisAttr(),
        customSeriesOptions: undefined
    };
}

function multiData(
    params: { n: number; groups: string[]; ds?: ListValue } = { n: 12, groups: ["alpha", "beta"] }
): PlotDataSeries {
    const x = { get: () => dynamicValue(Math.random().toString()) } as unknown as ListExpressionValue<string>;
    return {
        dataSet: "dynamic",
        dynamicDataSource: params.ds ?? list(params.n),
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
            const set1 = multiData();
            const set2 = singleData();
            const set3 = multiData({ n: 4, groups: ["a", "b", "c"] });
            const actionFn = jest.fn();
            const listAction = {
                get: jest.fn().mockRejectedValue(actionFn)
            } as unknown as ListActionValue;
            const series: PlotDataSeries[] = [set1, set2, set3].map(x => (x.onClickAction = listAction) && x);

            const { result } = renderHook(
                (props: { series: PlotDataSeries[]; mapFn: SeriesMapper<PlotDataSeries> }) =>
                    usePlotChartDataSeries(props.series, props.mapFn),
                {
                    initialProps: { series, mapFn: _ => ({}) }
                }
            );

            expect(result.current).toHaveLength(6);

            for (const data of result.current ?? []) {
                expect(data.onClick).toBeInstanceOf(Function);
            }
        });

        it("should call actionFn with corresponding ObjectItem", () => {
            const ds = list(4);
            const set1 = multiData({ n: 4, groups: ["a", "b"], ds });
            const actionFn = jest.fn();
            const listAction = {
                get: jest.fn().mockRejectedValue(actionFn)
            } as unknown as ListActionValue;
            set1.onClickAction = listAction;
            const series: PlotDataSeries[] = [set1];

            const { result } = renderHook(
                (props: { series: PlotDataSeries[]; mapFn: SeriesMapper<PlotDataSeries> }) =>
                    usePlotChartDataSeries(props.series, props.mapFn),
                {
                    initialProps: { series, mapFn: _ => ({}) }
                }
            );

            expect(result.current).toHaveLength(2);

            const [data1, data2] = result.current ?? [];
            const [object1, object2, object3, object4] = ds.items ?? [];
            const data1Objects = [object1, object3];
            const data2Objects = [object2, object4];
            data1.onClick?.(0);
            expect(actionFn).toHaveBeenLastCalledWith(data1Objects[0]);
            data1.onClick?.(1);
            expect(actionFn).toHaveBeenLastCalledWith(data1Objects[1]);
            data2.onClick?.(0);
            expect(actionFn).toHaveBeenLastCalledWith(data2Objects[0]);
            data2.onClick?.(1);
            expect(actionFn).toHaveBeenLastCalledWith(data2Objects[1]);
        });
    });
});
